/// <reference types="node" />
import { WriteStream } from 'fs';
import { File } from './File';
export declare class PrintStream {
    ws: WriteStream | null;
    private file;
    constructor(file: File);
    close(): void;
    println(msg: string): void;
    reset(): void;
}
//# sourceMappingURL=PrintStream.d.ts.map