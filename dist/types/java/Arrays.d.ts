import { ArrayList, Stream } from './ArrayList';
export declare class Arrays {
    static asList<T>(array: T[]): T[];
    static stream<T>(items: T[], from: number, upto: number): Stream<T>;
    static nCopies(length: number, value: number): number[];
    static rotate<T>(arr: ArrayList<T>, count: number): ArrayList<T>;
}
//# sourceMappingURL=Arrays.d.ts.map