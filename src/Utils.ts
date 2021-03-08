import { Level, Logger } from './Logger';
import { Timer } from './Timer';

export class Utils {
  static indexOf(titleCols: string[], arg1: string) {
    throw new Error('Method not implemented.');
    return 0;
  }
  static Stats = class Stats {
    static stats: Map<string, any> = new Map();
    static reset() {
      this.stats.clear();
    }
  };

  static Timers = class Timers {
    /**
     * @deprecated
     * @see TimersUnits
     */
    static Units = null;
    static in(timeSpan: number, units: TimersUnits) {
      return timeSpan / units;
    }
    static timers = new Map<string, Timer>();

    static now() {
      return process.hrtime()[1];
    }

    /**
     * Log the time that elapsed to the given logger. This will
     * {@link Timer#stop() stop} the timer and log its {@link
     * Timer#getElapsedTotal() total elapsed time}.
     *
     * @param name   Name of the timer.
     * @param logger Logger to log to.
     * @param level  Level to log at.
     * @see Timers#start(String)
     */
    static log(name: string, logger: Logger | null, level = Level.FINE) {
      this.timers.get(name)?.log(logger, name, level);
    }

    static start(name: string) {
      if (this.timers.has(name)) {
        this.timers.get(name)!.start();
      } else {
        this.timers.set(name, new Timer());
      }
    }

    static reset() {
      this.timers.clear();
    }
  };
}

export enum TimersUnits {
  NANOSECONDS = 1,
  MICROSECONDS = 1000,
  MILLISECONDS = 1000000,
  SECONDS = 1000000000,
}

export const Timers = Utils.Timers;
