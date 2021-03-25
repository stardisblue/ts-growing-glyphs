import { Rectangle2D } from "../java/Rectangle2D";
import { ArrayList } from "../java/ArrayList";
export declare class Utils {
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
    static clamp(value: number, min: number, max: number): number;
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
    /**
     * Returns the Euclidean distance between two points {@code p} and {@code q}.
     */
    static __euclideanAABB(px: number, py: number, qx: number, qy: number): number;
    /**
     * Returns the minimum Euclidean distance between a point and any point in
     * the given rectangle. This will in particular return -1 when the given
     * point is contained in the rectangle.
     */
    static __euclideanRectangleXY(rect: Rectangle2D, px: number, py: number): number;
    /**
     * Returns the index of an object in an array, or -1 if it cannot be found.
     * Uses {@link Object#equals(Object)} to compare objects.
     * @deprecated use Array#indexOf
     */
    static indexOf<T>(haystack: T[], needle: T): number;
    /**
     * Given two intervals [min, max], return whether they overlap. This method
     * uses at most two comparisons and no branching.
     *
     * @see #openIntervalsOverlap(double[], double[])
     */
    static intervalsOverlap(a: [number, number], b: [number, number]): boolean;
    /**
     * GIven an iterator, return a fresh iterable instance wrapping the iterator.
     * The returned iterable can only be used once, after that it will throw an
     * {@link Error}.
     *
     * @param iterator Iterator to be wrapped.
     * @deprecated i don't even understand why someone wants to do that !
     */
    static iterable<T>(iterator: Iterator<T>): Iterable<T>;
    /**
     * Join a bunch of strings, ignoring empty strings, with a custom glue.
     *
     * @param glue    String to insert between non-empty strings.
     * @param strings Strings to join.
     * @deprecated really useless in js
     */
    static join(glue: string, ...strings: string[]): string;
    /**
     * Given an array of keys and a map, return an array with all values in the
     * same order as the keys in the input array were.
     *
     * @param keys   Keys to look up.
     * @param map    Map to be used for mapping.
     * @param result Array to write results into. Should have appropriate length.
     */
    static map<K, V>(keys: K[], map: Map<K, V>, result: V[]): V[];
    /**
     * Given a zero-width or zero-height rectangle, return if that line segment
     * is on the border of the given rectangle.
     *
     * @param side Line segment to consider.
     * @param rect Rectangle to consider.
     */
    static onBorderOf(side: Rectangle2D, rect: Rectangle2D): boolean;
    /**
     * Given two intervals (min, max), return whether they overlap. This method
     * uses at most two comparisons and no branching.
     *
     * @see #intervalsOverlap(double[], double[])
     */
    static openIntervalsOverlap(a: [number, number], b: [number, number]): boolean;
    /**
     * Given an iterator, return the number of items in it.
     *
     * @param iterator Iterator that will be iterated to determine the number of
     *                 items it iterates over (when passed to this function).
     * @deprecated really, wtf ?
     */
    static size<T>(iterator: Iterator<T>): number;
    /**
     * Swap two objects from two lists.
     *
     * @param listA  First list.
     * @param indexA Index of item in first list to swap with second.
     * @param listB  Second list.
     * @param indexB Index of item in second list to swap with first.
     */
    static swap<T>(listA: ArrayList<T>, indexA: number, listB: ArrayList<T>, indexB: number): void;
    static Double: {
        new (): {};
        /**
         * Returns whether two double values are equal, up to a difference
         * of {@link Utils#EPS}. This accounts for inaccuracies.
         */
        eq(a: number, b: number): boolean;
        /**
         * Returns whether two double values are equal, meaning their
         * difference is greater than {@link Utils#EPS}.
         */
        neq(a: number, b: number): boolean;
    };
}
export declare function String__length(v: string): number;
export declare enum Units {
    NANOSECONDS = 1,
    MICROSECONDS = 1000,
    MILLISECONDS = 1000000,
    SECONDS = 1000000000
}
/**
 * shadowing locales
 */
export declare class Locales {
    /**
     * @deprecated
     */
    static get(): void;
    /**
     * @deprecated
     */
    pop(): void;
    /**
     * @deprecated
     */
    push(): void;
    /**
     * @deprecated
     */
    set(): void;
    static push(locale: any): void;
}
//# sourceMappingURL=Utils.d.ts.map