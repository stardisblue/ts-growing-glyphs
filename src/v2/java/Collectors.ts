import {ArrayList} from "./ArrayList";

export class Collectors {
    /**
     * @deprecated useless in js
     * @param create
     */
    static toCollection<T, R extends ArrayList<T>>(create: (list: T[]) => R): (list: T[]) => R {
        return create;
    }

    static toList() {
        return function <T>(p1: T[]) {
            return p1;
        };
    }

    static toSet() {
        return function<T> (items: T[]) {
            return Array.from(new Set(items));
        };
    }
}