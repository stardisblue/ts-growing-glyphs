import {PrintStream} from "./PrintStream";

const _loggers = new Map<string, Logger>();


export class Logger {
    isLoggable(level: Level) {
        let levelValue = this.level;
        if (level < levelValue || levelValue === Level.OFF) {
            return false;
        }
        return true;
    }

    private _name: any;
    private static _ps?: PrintStream;
    private level: number;

    private constructor(name: string) {
        this._name = name;
    }

    static getLogger(name: string) {
        if (_loggers.has(name)) {
            return _loggers.get(name)!;
        } else {
            const log = new Logger(name);
            _loggers.set(name, log);
            return log;
        }
    }


    static setPrintStream(ps: PrintStream) {
        this._ps = ps;
    }

    log(level: Level, msg: string) {
        if (level >= this.level) {
            if (Logger._ps) {
                Logger._ps.writeln(msg);
            } else {
                console.log(msg);
            }
        }
    }

    /**
     * @deprecated use #level
     */
    getLevel() {
        return this.level
    }

    setLevel(level: Level) {
        this.level = level
    }
}

export enum Level {
    OFF = Number.MAX_VALUE,
    SEVERE = 1000,
    WARNING = 900,
    INFO = 800,
    CONFIG = 700,

    FINE = 500,
    FINER = 400,
    FINEST = 300,
    ALL = Number.MIN_VALUE,
}
