import { ArrayList } from './ArrayList';
export declare class Collectors {
    /**
     * @deprecated useless in js
     * @param create
     */
    static toCollection<T, R extends ArrayList<T>>(create: (list: T[]) => R): (list: T[]) => R;
    static toList(): <T>(p1: T[]) => T[];
    static toSet(): <T>(items: T[]) => T[];
}
//# sourceMappingURL=Collectors.d.ts.map