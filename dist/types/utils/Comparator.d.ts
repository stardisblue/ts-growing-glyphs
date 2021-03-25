export declare class Comparator {
    static comparingInt<T>(callback: (value: T) => number): (a: T, b: T) => number;
    static comparing<T>(callback: (a: T) => string): (a: T, b: T) => 1 | -1 | 0;
}
//# sourceMappingURL=Comparator.d.ts.map