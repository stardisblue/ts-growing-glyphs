import {Level, Logger} from "./Logger";
import {Stat} from "./Stat";
import {Timer} from "./Timer";
import {Rectangle2D} from "./Rectangle2D";

export class Utils {
    static Stats = class Stats {
        static stats: Map<string, Stat> = new Map();

        static count(name: string, bool: boolean = true) {
            this.record(`[count] ${name}`, bool ? 1 : 0);
        }

        static record(name: string, value: number) {
            if (this.stats.has(name)) {
                this.stats.get(name).record(value);
            } else {
                this.stats.set(name, new Stat(value));
            }
        }

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
        static timers = new Map<string, Timer>();

        static stop(name: string) {
            this.timers.get(name).stop();
        }

        static in(timeSpan: number, units: TimersUnits) {
            return timeSpan / units;
        }

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

    /**
     * Given two intervals (min, max), return whether they overlap. This method
     * uses at most two comparisons and no branching.
     *
     * @see #intervalsOverlap(double[], double[])
     */
    static openIntervalsOverlap(a: [number, number], b: [number, number]) {
        return a[1] > b[0] && a[0] < b[1];
    }

    static indexOf(haystack: string[], needle: string) {
        for (let i = 0; i < haystack.length; ++i) {
            if (
                (haystack[i] === null && needle === null) ||
                (needle !== null && needle === haystack[i])
            )
                return i;
        }
        return -1;
    }

    static onBorderOf(side: Rectangle2D, rect: Rectangle2D) {
        return (
            (side.width === 0 &&
                (side.x === rect.getMinX() || side.x === rect.getMaxX()) &&
                side.getMinY() >= rect.getMinY() && side.getMaxY() <= rect.getMaxY()) ||
            (side.height === 0 &&
                (side.y == rect.getMinY() || side.y == rect.getMaxY()) &&
                side.getMinX() >= rect.getMinX() && side.getMaxX() <= rect.getMaxX())
        );
    }

    /**
     * Returns the minimum Euclidean distance between a point and any point in
     * the given rectangle. This will in particular return -1 when the given
     * point is contained in the rectangle.
     */
    static euclidean(rect: Rectangle2D, px: number, py: number) {
        if (rect.contains(px, py)) return -1;
        return this.euclidean2(px, py,
            this.clamp(px, rect.getMinX(), rect.getMaxX()),
            this.clamp(py, rect.getMinY(), rect.getMaxY()));
    }

    /**
     * Clamp a given value to within the given range.
     *
     * @param value Value to clamp.
     * @param min   Minimum value to return.
     * @param max   Maximum value to return.
     * @return The value closest to {@code value} that is within the closed
     * interval {@code [min, max]}.
     */
    private static clamp(value: number, min: number, max: number) {
        if (value < min) {
            return min;
        }

        return Math.min(value, max);
    }

    /**
     * Returns the Euclidean distance between two points {@code p} and {@code q}.
     */
    static euclidean2(px: number, py: number, qx: number, qy: number) {
        return Math.hypot(qx - px, qy - py);
    }

    /**
     * Swap two objects from two lists.
     *
     * @param listA  First list.
     * @param indexA Index of item in first list to swap with second.
     * @param listB  Second list.
     * @param indexB Index of item in second list to swap with first.
     */
    static swap<T>(listA: T[], indexA: number, listB: T[], indexB: number) {
        const tmp = listA[indexA];
        listA[indexA] = listB[indexB];
        listB[indexB] = tmp;
    }
}

export enum TimersUnits {
    NANOSECONDS = 1,
    MICROSECONDS = 1000,
    MILLISECONDS = 1000000,
    SECONDS = 1000000000,
}

export const Timers = Utils.Timers;
export const Stats = Utils.Stats;
