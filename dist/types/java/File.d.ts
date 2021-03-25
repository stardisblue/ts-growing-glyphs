export declare class File {
    readonly name: string;
    constructor(name: string);
    /**
     * @deprecated use #name
     */
    getName(): string;
}
export declare class FileOutputStream extends File {
    constructor(file: File);
}
//# sourceMappingURL=File.d.ts.map