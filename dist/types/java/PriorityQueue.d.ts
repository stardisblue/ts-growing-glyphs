import { Comparable } from "./Comparable";
export declare class PriorityQueue<T extends Comparable<T>> {
    private __internal;
    constructor(n?: number);
    add(merge: T): boolean;
    peek(): T;
    poll(): T;
    size(): number;
    isEmpty(): boolean;
}
//# sourceMappingURL=PriorityQueue.d.ts.map