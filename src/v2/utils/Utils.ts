import { isRectangle2D, Rectangle2D } from '../java/Rectangle2D';
import { StringBuilder } from '../java/StringBuilder';
import { ArrayList } from '../java/ArrayList';
import { Level, Logger } from '../java/Logger';
import { Pattern } from '../java/Pattern';
import { Comparator } from './Comparator';
import { Entry, HashMap } from '../java/HashMap';
import { Stat } from './Stat';
import { Timer } from './Timer';

export class Utils {
  /**
   * Epsilon, useful for double comparison.
   */
  static readonly EPS = 1e-7;

  /**
   * Clamp a given value to within the given range.
   *
   * @param value Value to clamp.
   * @param min   Minimum value to return.
   * @param max   Maximum value to return.
   * @return The value closest to {@code value} that is within the closed
   * interval {@code [min, max]}.
   */
  static clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    }
    return Math.min(value, max);
  }

  /**
   * Returns the Euclidean distance between two points {@code p} and {@code q}.
   */
  static euclidean(px: number, py: number, qx: number, qy: number): number;
  /**
   * Returns the minimum Euclidean distance between a point and any point in
   * the given rectangle. This will in particular return -1 when the given
   * point is contained in the rectangle.
   */
  static euclidean(rect: Rectangle2D, px: number, py: number): number;
  static euclidean(
    ...args: [number, number, number, number] | [Rectangle2D, number, number]
  ): number {
    if (
      args.length === 4 &&
      typeof args[0] === 'number' &&
      typeof args[1] === 'number' &&
      typeof args[2] === 'number' &&
      typeof args[3] === 'number'
    ) {
      return this.__euclideanAABB(...args);
    } else if (
      args.length === 3 &&
      isRectangle2D(args[0]) &&
      typeof args[1] === 'number' &&
      typeof args[2] === 'number'
    ) {
      return this.__euclideanRectangleXY(...args);
    }

    throw new Error('unable to resolve');
  }

  /**
   * Returns the Euclidean distance between two points {@code p} and {@code q}.
   */
  static __euclideanAABB(
    px: number,
    py: number,
    qx: number,
    qy: number
  ): number {
    return Math.hypot(qx - px, qy - py);
    // const dx = qx - px;
    // const dy = qy - py;
    // return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Returns the minimum Euclidean distance between a point and any point in
   * the given rectangle. This will in particular return -1 when the given
   * point is contained in the rectangle.
   */
  static __euclideanRectangleXY(
    rect: Rectangle2D,
    px: number,
    py: number
  ): number {
    if (rect.contains(px, py)) {
      return -1;
    }
    // determine the distance between the point and the point projected
    // onto the rectangle, or clamped into it, so to say
    return this.euclidean(
      px,
      py,
      this.clamp(px, rect.getMinX(), rect.getMaxX()),
      this.clamp(py, rect.getMinY(), rect.getMaxY())
    );
  }

  /**
   * Returns the index of an object in an array, or -1 if it cannot be found.
   * Uses {@link Object#equals(Object)} to compare objects.
   * @deprecated use Array#indexOf
   */
  static indexOf<T>(haystack: T[], needle: T): number {
    for (let i = 0; i < haystack.length; ++i) {
      if (
        (haystack[i] == null && needle == null) ||
        (needle != null && needle === haystack[i])
      ) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Given two intervals [min, max], return whether they overlap. This method
   * uses at most two comparisons and no branching.
   *
   * @see #openIntervalsOverlap(double[], double[])
   */
  static intervalsOverlap(a: [number, number], b: [number, number]): boolean {
    return a[1] >= b[0] && a[0] <= b[1];
  }

  /**
   * GIven an iterator, return a fresh iterable instance wrapping the iterator.
   * The returned iterable can only be used once, after that it will throw an
   * {@link Error}.
   *
   * @param iterator Iterator to be wrapped.
   * @deprecated i don't even understand why someone wants to do that !
   */
  static iterable<T>(iterator: Iterator<T>): Iterable<T> {
    return new (class NewIterable implements Iterable<T> {
      private callCount: number = 0;

      [Symbol.iterator](): Iterator<T> {
        if (++this.callCount == 1) {
          return iterator;
        }
        // can only be iterated once
        throw new Error(' can only be iterated once');
      }

      /**
       * @deprecated useless in js
       */
      iterator(): Iterator<T> {
        if (++this.callCount == 1) {
          return iterator;
        }
        // can only be iterated once
        throw new Error(' can only be iterated once');
      }
    })();
  }

  /**
   * Join a bunch of strings, ignoring empty strings, with a custom glue.
   *
   * @param glue    String to insert between non-empty strings.
   * @param strings Strings to join.
   * @deprecated really useless in js
   */
  static join(glue: string, ...strings: string[]) {
    const sb = new StringBuilder();
    for (const str of strings) {
      if (sb.length() > 0 && str.length !== 0) {
        sb.append(glue);
      }
      sb.append(str);
    }
    return sb.toString();
  }

  /**
   * Given an array of keys and a map, return an array with all values in the
   * same order as the keys in the input array were.
   *
   * @param keys   Keys to look up.
   * @param map    Map to be used for mapping.
   * @param result Array to write results into. Should have appropriate length.
   */
  static map<K, V>(keys: K[], map: Map<K, V>, result: V[]): V[] {
    for (let i = 0; i < keys.length; ++i) {
      result[i] = map.get(keys[i]);
    }
    return result;
  }

  /**
   * Given a zero-width or zero-height rectangle, return if that line segment
   * is on the border of the given rectangle.
   *
   * @param side Line segment to consider.
   * @param rect Rectangle to consider.
   */
  static onBorderOf(side: Rectangle2D, rect: Rectangle2D): boolean {
    return (
      (side.getWidth() == 0 &&
        (side.getX() == rect.getMinX() || side.getX() == rect.getMaxX()) &&
        side.getMinY() >= rect.getMinY() &&
        side.getMaxY() <= rect.getMaxY()) ||
      (side.getHeight() == 0 &&
        (side.getY() == rect.getMinY() || side.getY() == rect.getMaxY()) &&
        side.getMinX() >= rect.getMinX() &&
        side.getMaxX() <= rect.getMaxX())
    );
  }

  /**
   * Given two intervals (min, max), return whether they overlap. This method
   * uses at most two comparisons and no branching.
   *
   * @see #intervalsOverlap(double[], double[])
   */
  static openIntervalsOverlap(
    a: [number, number],
    b: [number, number]
  ): boolean {
    return a[1] > b[0] && a[0] < b[1];
  }

  /**
   * Given an iterator, return the number of items in it.
   *
   * @param iterator Iterator that will be iterated to determine the number of
   *                 items it iterates over (when passed to this function).
   * @deprecated really, wtf ?
   */
  static size<T>(iterator: Iterator<T>): number {
    let count = 0;
    let res = iterator.next();
    for (; !res.done; res = iterator.next()) {
      count++;
    }
    return count;
  }

  /**
   * Swap two objects from two lists.
   *
   * @param listA  First list.
   * @param indexA Index of item in first list to swap with second.
   * @param listB  Second list.
   * @param indexB Index of item in second list to swap with first.
   */
  static swap<T>(
    listA: ArrayList<T>,
    indexA: number,
    listB: ArrayList<T>,
    indexB: number
  ) {
    const tmp = listA.get(indexA);
    listA.set(indexA, listB.get(indexB));
    listB.set(indexB, tmp);
  }

  static Double = class Double {
    /**
     * Returns whether two double values are equal, up to a difference
     * of {@link Utils#EPS}. This accounts for inaccuracies.
     */
    static eq(a: number, b: number): boolean {
      return Math.abs(a - b) <= Utils.EPS;
    }

    /**
     * Returns whether two double values are equal, meaning their
     * difference is greater than {@link Utils#EPS}.
     */
    static neq(a: number, b: number) {
      return !this.eq(a, b);
    }
  };
}

export function String__length(v: string) {
  return v.length;
}

export class Stats {
  private static readonly TAG_REGEX: Pattern = Pattern.compile(
    /^\[([a-z]+)]\\s+/
  );

  /**
   * Map of stat names to objects recording full stat information.
   */
  private static readonly stats: HashMap<string, Stat> = new HashMap();

  static count(name: string);
  static count(name: string, bool: boolean);
  static count(name: string, bool?: boolean) {
    if (bool !== undefined) {
      this.__countStringBoolean(name, bool);
    }
    this.__countString(name);
  }

  static __countString(name: string) {
    this.record('[count] ' + name, 1);
  }

  static __countStringBoolean(name: string, bool: boolean) {
    this.record('[perc] ' + name, bool ? 1 : 0);
  }

  static get(name: string): Stat {
    if (!this.stats.containsKey(name)) {
      this.stats.put(name, new Stat(0));
    }
    return this.stats.get(name);
  }

  static log(name: string, logger: Logger) {
    if (!this.stats.containsKey(name)) {
      return;
    }
    this.stats.get(name).log(logger, name);
  }

  static logAll(logger: Logger) {
    logger.log(Level.FINE, '');
    logger.log(Level.FINE, 'STATS');
    const padTo = this.stats
      .keySet()
      .stream()
      .filter((n) => {
        const tagMatcher = this.TAG_REGEX.matcher(n);
        return !tagMatcher.find() || tagMatcher.group(1) !== 'perc';
      })
      .map((n) => this.TAG_REGEX.matcher(n).replaceAll(''))
      .max(Comparator.comparingInt(String__length))
      .get().length;
    // const f = "%1$-" + padTo + "s";

    const f = (k) => `${k}-${padTo}s`;
    this.stats
      .entrySet()
      .stream()
      // taking advantage of js sorting system
      .sorted(Comparator.comparing((a) => this.noTag(a.getKey())))

      // .sorted(Comparator.comparing(a => this.noTag(a.getKey())))
      .forEach((e) => {
        const tagMatcher = this.TAG_REGEX.matcher(e.getKey());
        if (tagMatcher.find()) {
          const tag = tagMatcher.group(1);
          const n = f(tagMatcher.replaceAll(''));
          if (tag === 'perc') {
            e.getValue().logPercentage(logger, n);
          } else {
            e.getValue().logCount(logger, n);
          }
        } else {
          e.getValue().log(logger, f(e.getKey()));
        }
      });
  }

  static record(name: string, value: number) {
    if (this.stats.containsKey(name)) {
      this.stats.get(name).record(value);
    } else {
      const stat = new Stat(value);
      this.stats.put(name, stat);
    }
  }

  static remove(name: string) {
    this.stats.remove(name);
  }

  static reset() {
    this.stats.clear();
  }

  /**
   * Given a stat name, return the name without tag.
   */
  private static noTag(name: string): string {
    const tagMatcher = this.TAG_REGEX.matcher(name);
    if (tagMatcher.find()) {
      return tagMatcher.replaceAll('').trim();
    }
    return name;
  }
}

export enum Units {
  NANOSECONDS = 1,
  MICROSECONDS = 1000,
  MILLISECONDS = 1000000,
  SECONDS = 1000000000,
}

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
  static log(name: string, logger: Logger);
  static log(name: string, logger: Logger, level: Level);
  static log(name: string, logger: Logger, level: Level = Level.FINE) {
    if (!this.timers.containsKey(name)) {
      return;
    }
    this.timers.get(name).log(logger, name, level);
  }

  /**
   * Log the time that elapsed on all timers recorded so far. This will
   * {@link Timer#stop() stop} the timers and log their {@link
   * Timer#getElapsedTotal() total elapsed time}.
   *
   * @param logger Logger to log to.
   */
  static logAll(logger: Logger) {
    logger.log(Level.FINE, '');
    logger.log(Level.FINE, 'TIMERS');
    const padTo = this.timers
      .keySet()
      .stream()
      .max(Comparator.comparingInt(String__length))
      .get().length;
    // const f = "%1$-" + padTo + "s";
    const f = (k: string) => `${k}-${padTo}s`;
    // log entries without section
    this.timers
      .entrySet()
      .stream()
      .filter((e) => !e.getKey().startsWith('['))
      .sorted(Entry.comparingByKey())
      .forEach((e) => e.getValue().log(logger, f(e.getKey())));
    // log entries in a section
    const timersInSections = this.timers
      .entrySet()
      .stream()
      .filter((e) => e.getKey().startsWith('['))
      .sorted(Entry.comparingByKey())
      .toArray();
    let lastSection = '';
    for (const timersInSection of timersInSections) {
      const e = timersInSection;
      const offset = e.getKey().indexOf(']') + 1;
      const section = e.getKey().substring(0, offset);
      if (section !== lastSection) {
        lastSection = section;
        logger.log(Level.FINE, '');
        logger.log(Level.FINE, lastSection);
      }
      e.getValue().log(logger, f(e.getKey().substring(offset + 1)));
    }
  }

  /**
   * Returns a timestamp that can be used to measure elapsed time.
   */
  static now(): number {
    const [seconds, nano] = process.hrtime();
    return seconds * 10e9 + nano;
  }

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

/**
 * shadowing locales
 */
export class Locales {
  /**
   * @deprecated
   */
  static get() {}

  /**
   * @deprecated
   */
  pop() {}

  /**
   * @deprecated
   */
  push() {}

  /**
   * @deprecated
   */
  set() {}

  static push(locale: any) {}
}
