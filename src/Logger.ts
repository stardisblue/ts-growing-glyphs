import {createWriteStream, WriteStream} from 'fs';

export class Logger {
    static writeStream: WriteStream | null = null;
    level = Level.FINEST;

    constructor() {
    }

    static redirectTo(path: string) {
        if (this.writeStream) this.close();
        this.writeStream = createWriteStream(path);
    }

    static undoRedirect() {
        this.writeStream = null;
    }

    static close() {
        if (this.writeStream) this.writeStream.end();
    }

    isLoggable(level: Level) {
        return !(level < this.level || this.level === Level.OFF);
    }

    getLevel() {
        return this.level;
    }

    log(level: Level, msg: string) {
        if (level >= this.level) {
            if (Logger.writeStream) {
                Logger.writeStream.write(msg);
            } else {
                console.log(msg);
            }
        }
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
