export class Type {
    static readonly MERGE = new Type("merge", 0);
    static readonly OUT_OF_CELL = new Type("out of cell", 10);
    private readonly name: string;
    private readonly priority: number;

    constructor(name: string, priority: number) {
        this.name = name;
        this.priority = priority;
    }

    toString() {
        return this.name + "event";
    }
}