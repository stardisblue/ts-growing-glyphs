import { Level, Logger } from "../java/Logger";
import { Units } from "./Utils";
export declare class Timers {
    /**
     * Map of timer names to objects recording full timer information.
     */
    private static readonly timers;
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
    static elapsed(name: string): number;
    /**
     * Returns the given timespan in a given unit.
     *
     * @param timeSpan Timespan in nanoseconds.
     * @param units    Unit to transform into.
     * @deprecated use Timer.in
     */
    static in(timeSpan: number, units: Units): number;
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
    static log(name: string, logger: Logger | null): any;
    static log(name: string, logger: Logger | null, level: Level): any;
    /**
     * Log the time that elapsed on all timers recorded so far. This will
     * {@link Timer#stop() stop} the timers and log their {@link
      * Timer#getElapsedTotal() total elapsed time}.
     *
     * @param logger Logger to log to.
     */
    static logAll(logger: Logger): void;
    /**
     * Start a new timer with the given name. Overwrites any existing timer
     * with the same name, so can be used to restart timers too.
     *
     * @param name Name of the timer. Used when reading off elapsed time.
     * @see Utils.Timers#log(String, Logger)
     */
    static start(name: string): void;
    /**
     * Record time passed since last start event on the given timer. This
     * time will now be included in {@code getElapsedTotal}. Stopping a
     * stopped timer has no effect.
     *
     * @param name Name of the timer to stop.
     */
    static stop(name: string): void;
    static reset(): void;
}
//# sourceMappingURL=Timers.d.ts.map