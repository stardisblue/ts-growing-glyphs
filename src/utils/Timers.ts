import {Entry, HashMap} from "../java/HashMap";
import {Timer} from "./Timer";
import {Level, Logger} from "../java/Logger";
import {Comparator} from "./Comparator";
import {ArrayList} from "../java/ArrayList";
import {String__length, Units} from "./Utils";

export class Timers {
  /**
   * Map of timer names to objects recording full timer information.
   */
  private static readonly timers: HashMap<string, Timer> = new HashMap();

  /**
   * Returns how much time has passed between all start and stop events on
   * the given timer. When the timer is currently running, that time is
   * <em>not</em> included in this value.
   * <p>
   * Use {@link #in(long, Units)} to convert the value returned by this
   * function to a specific time unit.
   *
   * @param name Name of the timer.
   * @see #in(long, Units)
   */
  static elapsed(name: string): number {
    if (!this.timers.containsKey(name)) {
      return -1;
    }
    return this.timers.get(name).getElapsedTotal();
  }

  /**
   * Returns the given timespan in a given unit.
   *
   * @param timeSpan Timespan in nanoseconds.
   * @param units    Unit to transform into.
   * @deprecated use Timer.in
   */
  static in(timeSpan: number, units: Units): number {
    return timeSpan / units;
  }

  /**
   * Log the time that elapsed to the given logger. This will
   * {@link Timer#stop() stop} the timer and log its {@link
    * Timer#getElapsedTotal() total elapsed time}.
   * <p>
   * This will log at level {@link Level#FINE}.
   *
   * @param name   Name of the timer.
   * @param logger Logger to log to.
   * @see Utils.Timers#start(String)
   */
  static log(name: string, logger: Logger | null);
  static log(name: string, logger: Logger | null, level: Level);
  static log(name: string, logger: Logger | null, level: Level = Level.FINE) {
    if (!this.timers.containsKey(name)) {
      return;
    }
    this.timers.get(name)!.log(logger, name, level);
  }

  /**
   * Log the time that elapsed on all timers recorded so far. This will
   * {@link Timer#stop() stop} the timers and log their {@link
    * Timer#getElapsedTotal() total elapsed time}.
   *
   * @param logger Logger to log to.
   */
  static logAll(logger: Logger) {
    logger.log(Level.FINE, "");
    logger.log(Level.FINE, "TIMERS");
    let seen = false;
    let best = null;
    const comparator = Comparator.comparingInt(String__length);
    for (const s of this.timers.keySet()) {
      if (!seen || comparator(s, best) > 0) {
        seen = true;
        best = s;
      }
    }
    const padTo = (seen ? best : "").length;
    // const f = "%1$-" + padTo + "s";
    const f = (k: string) => k.padEnd(padTo);
    // log entries without section
    const toSort = new ArrayList<Entry<string, Timer>>();
    for (const stringTimerEntry of this.timers.entrySet()) {
      if (!stringTimerEntry.getKey().startsWith("[")) {
        toSort.add(stringTimerEntry);
      }
    }
    toSort.sort(Entry.comparingByKey());
    for (const stringTimerEntry of toSort) {
      stringTimerEntry.getValue().log(logger, f(stringTimerEntry.getKey()));
    }
    // log entries in a section
    const list = new ArrayList<Entry<string, Timer>>();
    for (const stringTimerEntry of this.timers.entrySet()) {
      if (stringTimerEntry.getKey().startsWith("[")) {
        list.add(stringTimerEntry);
      }
    }
    list.sort(Entry.comparingByKey());
    const timersInSections = list.toArray();
    let lastSection = "";
    for (const timersInSection of timersInSections) {
      const e = timersInSection;
      const offset = e.getKey().indexOf("]") + 1;
      const section = e.getKey().substring(0, offset);
      if (section !== lastSection) {
        lastSection = section;
        logger.log(Level.FINE, "");
        logger.log(Level.FINE, lastSection);
      }
      e.getValue().log(logger, f(e.getKey().substring(offset + 1)));
    }
  }

  // /**
  //  * Returns a timestamp that can be used to measure elapsed time.
  //  * @deprecated use Timer.now
  //  */
  // static now(): number {
  //   const [seconds, nano] = process.hrtime();
  //   return seconds * 10e9 + nano;
  // }

  /**
   * Start a new timer with the given name. Overwrites any existing timer
   * with the same name, so can be used to restart timers too.
   *
   * @param name Name of the timer. Used when reading off elapsed time.
   * @see Utils.Timers#log(String, Logger)
   */
  static start(name: string): void {
    if (this.timers.containsKey(name)) {
      this.timers.get(name).start();
    } else {
      this.timers.put(name, new Timer());
    }
  }

  /**
   * Record time passed since last start event on the given timer. This
   * time will now be included in {@code getElapsedTotal}. Stopping a
   * stopped timer has no effect.
   *
   * @param name Name of the timer to stop.
   */
  public static stop(name: string): void {
    this.timers.get(name).stop();
  }

  public static reset(): void {
    this.timers.clear();
  }
}