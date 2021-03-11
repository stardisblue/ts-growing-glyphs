import TinyQueue from "tinyqueue";

export class PriorityQueue<T> {
    private __internal: TinyQueue<T>;

    constructor(n?: number) {
        this.__internal = new TinyQueue();
    }

    add(merge: T): boolean {
        this.__internal.push(merge);
        return true;
    }

    peek(): T {
        return this.__internal.peek();
    }

    poll(): T {
        return this.__internal.pop();
    }

    size(): number {
        return this.__internal.length;
    }

    isEmpty() {
        return this.__internal.length === 0;
    }
}