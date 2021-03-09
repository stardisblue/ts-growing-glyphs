import TinyQueue from "tinyqueue";

export class PriorityQueue<T> {
    private _heap: TinyQueue<T>;

    constructor(n = 0) {
        this._heap = new TinyQueue();
    }
}
