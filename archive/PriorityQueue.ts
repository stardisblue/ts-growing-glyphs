import TinyQueue from "tinyqueue";

export class PriorityQueue<T> extends TinyQueue<T> {
    private _heap: TinyQueue<T>;

    constructor(n = 0) {
        super();
    }
}
