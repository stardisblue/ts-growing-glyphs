import { PrintStream } from "./PrintStream";
export declare class Logger {
    isLoggable(level: Level): boolean;
    private _name;
    static _ps?: PrintStream;
    private level;
    private constructor();
    static getLogger(name: string): Logger;
    static setPrintStream(ps: PrintStream): void;
    log(level: Level, msg: string): any;
    /**
     * @deprecated use #level
     */
    getLevel(): number;
    setLevel(level: Level): void;
}
export declare enum Level {
    OFF,
    SEVERE = 1000,
    WARNING = 900,
    INFO = 800,
    CONFIG = 700,
    FINE = 500,
    FINER = 400,
    FINEST = 300,
    ALL
}
//# sourceMappingURL=Logger.d.ts.map