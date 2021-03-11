import {PriorityQueue} from "./PriorityQueue";
import {Event} from "./Event";
import {Stats, Timers} from "./Utils";

export class MultiQueue extends PriorityQueue<Event> {
    counts: number[];
    id: number;
    next: MultiQueue;
    root: MultiQueue;
    private INSERTION = 0;

    constructor(capacity: number, previous: MultiQueue = null) {
        super(capacity);

        this.counts = previous === null ? new Array(3) : null;
        this.id = previous === null ? 0 : previous.id + 1;

        this.next = null;
        this.root = previous === null ? this : previous.root;
    }

    push(item: Event) {
        // this.count(this.INSERTION);
        if (this === this.root) {
            Timers.start("queue operations");
        }
        const t = super.push(item);
        if (this === this.root) {
            Timers.stop("queue operations");
            Stats.record(item.getType().toString(), 1);
        }
        return 1;
    }

}
