import {ArrayList} from "./ArrayList";

/**
 * @deprecated use Map, only used for shadowing
 */
export class HashMap<K, V> extends Map<K, V> {

    /**
     * @deprecated use Map#has
     */
    containsKey(key: K) {
        return this.has(key);
    }

    /**
     * @deprecated use Map#set
     */
    put(name: K, value: V) {
        return this.set(name, value);
    }

    /**
     * @deprecated use Map#keys
     */
    keySet() {
        return ArrayList.__new(Array.from(this.keys()));
    }

    /**
     * @deprecated use Map#entries
     */
    entrySet() {
        return ArrayList.__new(Array.from(this.entries(), ([k, v]) => new Entry(k, v)));
    }

    /**
     * @deprecated use Map#delete
     */
    remove(key: K) {
        return this.delete(key);
    }
}

export class Entry<K, V> {
    key: K;
    value: V;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }

    /**
     * @deprecated use #key
     */
    getKey() {
        return this.key;
    }

    /**
     * @deprecated use #value
     */
    getValue() {
        return this.value;
    }

    static comparingByKey<V>() {
        return (a: Entry<string, V>, b: Entry<string, V>) => {
            return a.getKey() < b.getKey() ? -1 : a.getKey() > b.getKey() ? 1 : 0;
        };

    }
}