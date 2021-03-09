import {PriorityQueue} from './PriorityQueue';
import {Event} from './Event';

export class MultiQueue extends PriorityQueue<Event> {
    counts: any[];
    id: any;
    next: any;
    root: any;

    constructor(capacity: number, previous: MultiQueue = null) {
        super(capacity);

        this.counts = previous === null ? new Array(3) : null;
        this.id = previous === null ? 0 : previous.id + 1;

        this.next = null;
        this.root = previous === null ? this : previous.root;
    }
}
