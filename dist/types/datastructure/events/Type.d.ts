export declare class Type {
    static readonly MERGE: Type;
    static readonly OUT_OF_CELL: Type;
    static readonly _values: Type[];
    private readonly name;
    readonly priority: number;
    constructor(name: string, priority: number);
    toString(): string;
    static values(): Type[];
}
//# sourceMappingURL=Type.d.ts.map