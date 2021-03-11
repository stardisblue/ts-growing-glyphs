export class Type {
    static readonly MERGE = new Type("merge", 0);
    static readonly OUT_OF_CELL = new Type("out of cell", 10);
    static readonly _values = [Type.MERGE, Type.OUT_OF_CELL]
    private readonly name: string;
    readonly priority: number;

    constructor(name: string, priority: number) {
        this.name = name;
        this.priority = priority;
    }

    toString() {
        return this.name + "event";
    }

    static values() {
        return this._values
    }
}