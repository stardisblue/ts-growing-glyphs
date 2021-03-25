import { ArrayList } from './ArrayList';
/**
 * @deprecated use Map, only used for shadowing
 */
export declare class HashMap<K, V> extends Map<K, V> {
    constructor();
    /**
     * @deprecated use Map#has
     */
    containsKey(key: K): boolean;
    /**
     * @deprecated use Map#set
     */
    put(name: K, value: V): this;
    /**
     * @deprecated use Map#keys
     */
    keySet(): ArrayList<K>;
    /**
     * @deprecated use Map#entries
     */
    entrySet(): ArrayList<Entry<K, V>>;
    /**
     * @deprecated use Map#delete
     */
    remove(key: K): boolean;
}
export declare class Entry<K, V> {
    key: K;
    value: V;
    constructor(key: K, value: V);
    /**
     * @deprecated use #key
     */
    getKey(): K;
    /**
     * @deprecated use #value
     */
    getValue(): V;
    static comparingByKey<V>(): (a: Entry<string, V>, b: Entry<string, V>) => 1 | -1 | 0;
}
//# sourceMappingURL=HashMap.d.ts.map