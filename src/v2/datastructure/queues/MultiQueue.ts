import {PriorityQueue} from "../../java/PriorityQueue";
import {Event} from "../events/Event";
import {Stats, Timers} from "../../utils/Utils";

export class MultiQueue extends PriorityQueue<Event> {
    private static readonly INSERTION: number = 0;
    private static readonly DELETION: number = 0;
    private static readonly DISCARD: number = 0;

    /**
     * Counts in the order insertions, deletions, discards.
     */
    private readonly counts: number[];
    /**
     * Number in queue chain. First queue has ID 0, then 1, ...
     */
    private readonly id: number;
    /**
     * Pointer to next queue, when split.
     */
    private readonly next: MultiQueue;
    /**
     * Pointer to first queue of all queues.
     */
    private readonly root: MultiQueue;

    constructor(capacity: number)
    constructor(previous: MultiQueue, capacity: number)
    constructor(a: MultiQueue | number, capacity?: number) {
        let shadow_capacity = capacity;
        let previous: MultiQueue | null = null;
        if (typeof a === "number") {
            shadow_capacity = a;
        } else {
            previous = a;
        }
        super(shadow_capacity);

        this.counts = (previous === null ? [0, 0, 0] : null);
        this.id = (previous === null ? 0 : previous.id + 1);

        this.next = null;
        this.root = (previous === null ? this : previous.root);

    }

    /**
     * Returns the number of deletions from this queue.
     */
    getDeletions(): number {
        return this.getCount(MultiQueue.DELETION);
    }

    /**
     * Returns the number of elements that was discarded.
     */
    public getDiscarded(): number {
        return this.getCount(MultiQueue.DISCARD);
    }


    /**
     * Returns the number of elements that was added.
     */
    public getInsertions(): number {
        return this.getCount(MultiQueue.INSERTION);
    }

    getNumQueues(): number {
        let q: MultiQueue = this;
        while (q.next !== null) {
            q = q.next;
        }
        return q.id + 1;
    }

    add(e: Event): boolean {
        this.count(MultiQueue.INSERTION);
        if (this === this.root) {
            Timers.start("queue operations");
        }
        // not split yet, or element can go here anyway?
        const t = super.add(e);
        if (this === this.root) {
            Timers.stop("queue operations");
            Stats.record(e.getType().toString(), 1);
        }
        return t;
    }

    discard(): void {
        this.count(MultiQueue.DISCARD);
        this._pollString(" discarded");
    }

    public peek(): Event {
        let e = super.peek();
        // try to find something better in next queue(s)
        if (this.next !== null) {
            const f = this.next.peek();
            if (e == null || (f != null && f.getAt() < e.getAt())) {
                e = f;
            }
        }
        return e;
    }



    poll(): Event {
        this.count(MultiQueue.DELETION);
        return this._pollString(" handled");
    }

    private _pollString(type: string): Event {
        Timers.start("queue operations");
        const e = this.peek();
        this._pollEvent(e);
        Timers.stop("queue operations");
        Stats.record("queue size", this.size());
        Stats.record(e.getType().toString() + type, 1);
        return e;
    }

    private _pollEvent(e: Event) {
        if (super.peek() == e) {
            super.poll();
            return;
        }
        // the way we found `e` means that there must be a `next` now
        this.next._pollEvent(e);
    }

    size(): number {
        return this.root.sizeNoPrev();
    }

    private count(index: number) {
        this.root.counts[index]++;
    }

    private getCount(index: number): number {
        return this.root.counts[index];
    }

    private sizeNoPrev(): number {
        return super.size() + (this.next == null ? 0 : this.next.sizeNoPrev());
    }

}