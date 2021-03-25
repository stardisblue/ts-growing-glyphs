import { PriorityQueue } from '../../java/PriorityQueue';
import { Event } from '../events/Event';
export declare class MultiQueue extends PriorityQueue<Event> {
    private static readonly INSERTION;
    private static readonly DELETION;
    private static readonly DISCARD;
    /**
     * Counts in the order insertions, deletions, discards.
     */
    private readonly counts;
    /**
     * Number in queue chain. First queue has ID 0, then 1, ...
     */
    private readonly id;
    /**
     * Pointer to next queue, when split.
     */
    private readonly next;
    /**
     * Pointer to first queue of all queues.
     */
    private readonly root;
    constructor(capacity: number);
    constructor(previous: MultiQueue, capacity: number);
    /**
     * Returns the number of deletions from this queue.
     */
    getDeletions(): number;
    /**
     * Returns the number of elements that was discarded.
     */
    getDiscarded(): number;
    /**
     * Returns the number of elements that was added.
     */
    getInsertions(): number;
    getNumQueues(): number;
    add(e: Event): boolean;
    discard(): void;
    peek(): Event;
    poll(): Event;
    private _pollString;
    private _pollEvent;
    size(): number;
    private count;
    private getCount;
    private sizeNoPrev;
}
//# sourceMappingURL=MultiQueue.d.ts.map