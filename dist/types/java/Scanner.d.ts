import { File } from './File';
export declare class Scanner {
    private file;
    private __it;
    private _cache;
    precheck: boolean;
    constructor(file: File);
    hasNextLine(): Promise<true>;
    nextLine(): Promise<string>;
}
//# sourceMappingURL=Scanner.d.ts.map