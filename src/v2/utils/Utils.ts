import {isRectangle2D, Rectangle2D} from "../java/Rectangle2D";
import {StringBuilder} from "../java/StringBuilder";
import {ArrayList} from "../java/ArrayList";

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
   * @deprecated
   */
  static euclidean(rect: Rectangle2D, px: number, py: number): number;
  static euclidean(
    ...args: [number, number, number, number] | [Rectangle2D, number, number]
  ): number {
    if (
      args.length === 4 &&
      typeof args[0] === "number" &&
      typeof args[1] === "number" &&
      typeof args[2] === "number" &&
      typeof args[3] === "number"
    ) {
      return this.__euclideanAABB(...args);
    } else if (
      args.length === 3 &&
      isRectangle2D(args[0]) &&
      typeof args[1] === "number" &&
      typeof args[2] === "number"
    ) {
      return this.__euclideanRectangleXY(...args);
    }

    throw new Error("unable to resolve");
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
    return this.__euclideanAABB(
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
        if (++this.callCount === 1) {
          return iterator;
        }
        // can only be iterated once
        throw new Error(" can only be iterated once");
      }

      /**
       * @deprecated useless in js
       */
      iterator(): Iterator<T> {
        if (++this.callCount === 1) {
          return iterator;
        }
        // can only be iterated once
        throw new Error(" can only be iterated once");
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
    let res: IteratorResult<T> = {done: false, value: null};
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

export enum Units {
  NANOSECONDS = 1,
  MICROSECONDS = 1000,
  MILLISECONDS = 1000000,
  SECONDS = 1000000000,
}

/**
 * shadowing locales
 */
export class Locales {
  /**
   * @deprecated
   */
  static get() {
  }

  /**
   * @deprecated
   */
  pop() {
  }

  /**
   * @deprecated
   */
  push() {
  }

  /**
   * @deprecated
   */
  set() {
  }

  static push(locale: any) {
  }
}
