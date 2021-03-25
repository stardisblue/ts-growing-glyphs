export declare class ArrayList<T> implements Iterable<T> {
    __internal: T[];
    toString(): string;
    static __new<T>(list: T[]): ArrayList<T>;
    constructor(size?: number);
    addI(index: number, value: T): void;
    add(value: T): boolean;
    addAll(values: T[]): boolean;
    [Symbol.iterator](): Iterator<T>;
    get length(): number;
    clear(): void;
    /**
     * @deprecated useless in js
     */
    stream(): Stream<T>;
    get(index: number): T;
    contains(glyph: T): boolean;
    size(): number;
    isEmpty(): boolean;
    removeI(index: number): T;
    remove(item: T): boolean;
    set(index: number, item: T): T;
    poll(): T;
    pollLast(): T;
    getLast(): T;
    addFirst(item: T): number;
    sort(comparator?: (hc1: T, hc2: T) => number): T[];
    toArray(): T[];
    copy(): ArrayList<T>;
    sorted(): void;
}
declare class Optional<K> {
    private readonly value;
    constructor(value: K);
    get(): K;
}
export declare class Stream<T> {
    protected __internal: T[];
    constructor(array: T[]);
    get length(): number;
    filter(callbackfn: (item: T, index: number, arr: T[]) => boolean): this;
    collect<R>(toCollection: (array: T[]) => R): R;
    map<R>(callbackfn: (item: T, index: number, arr: T[]) => R): Stream<R>;
    mapToInt(callbackfn: (item: T, index: number, arr: T[]) => number): NumberStream;
    max(comparator: (a: T, b: T) => number): Optional<T>;
    sorted(comparator: (a: T, b: T) => number): this;
    toArray(): T[];
    forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
    parallel(): this;
    flatMap<R>(callbackfn?: (value: T, index: number, array: T[]) => R[]): Stream<R>;
    iterator(): IterableIterator<T>;
    distinct(): Stream<T>;
}
declare class NumberStream extends Stream<number> {
    sum(): number;
}
export {};
//# sourceMappingURL=ArrayList.d.ts.map