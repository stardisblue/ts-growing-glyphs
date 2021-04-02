import {PrintStream} from "./PrintStream";
import {Constants} from "../utils/Constants";

const _loggers = new Map<string, Logger>();

export class Logger {
  isLoggable(level: Level) {
    let levelValue = this.level;
    return !(level < levelValue || levelValue === Level.OFF);
  }

  private _name: any;
  static _ps?: PrintStream;
  private level: number;

  private constructor(name: string, level = Level.FINE) {
    this._name = name;
    this.level = level;
  }

  static getLogger(name: string) {
    if (!Constants.LOGGING_ENABLED) return null;
    if (_loggers.has(name)) {
      return _loggers.get(name)!;
    } else {
      const log = new Logger(name);
      _loggers.set(name, log);
      return log;
    }
  }

  static setPrintStream(ps: PrintStream) {
    ps.reset();
    this._ps = ps;
  }

  log(level: Level, msg: string) {
    if (!Constants.LOGGING_ENABLED) return null;
    if (level >= this.level) {
      let prefix = "";
      let offset = 2;
      switch (level) {
        case Level.OFF:
          prefix = "OFF";
          break;
        case Level.SEVERE:
          prefix = "SEVERE";
          break;
        case Level.WARNING:
          prefix = "WARNING";
          break;
        case Level.INFO:
          prefix = "INFO";
          break;
        case Level.CONFIG:
          prefix = "CONFIG";
          break;
        case Level.FINE:
          prefix = "FINE";
          break;
        case Level.FINER:
          prefix = "FINER";
          offset = 4;
          break;
        case Level.FINEST:
          prefix = "FINEST";
          offset = 6;
          break;
        case Level.ALL:
          prefix = "All";
          break;
      }

      prefix = prefix.padEnd(8) + "|" + "".padEnd(offset);

      if (Logger._ps) {
        Logger._ps.println(prefix + msg);
      } else {
        console.log(prefix + msg);
      }
    }
  }

  /**
   * @deprecated use #level
   */
  getLevel() {
    return this.level;
  }

  setLevel(level: Level) {
    this.level = level;
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
