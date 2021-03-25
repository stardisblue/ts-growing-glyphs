import { Units } from './Utils';
import { Level, Logger } from '../java/Logger';
export declare class Timer {
    private count;
    private running;
    private started;
    private totalElapsed;
    /**
     * Construct a new timer, and immediately start it.
     */
    constructor();
    /**
     * Returns a timestamp that can be used to measure elapsed time.
     */
    static now(): number;
    /**
     * Returns how much time passed since this timer was last started.
     */
    getElapsed(): number;
    /**
     * Returns how much time has passed between all start and stop events on
     * this timer. When the timer is currently running, that time is <em>not</em>
     * included in this value.
     */
    getElapsedTotal(): number;
    /**
     * Returns how many times this timer was stopped.
     */
    getNumCounts(): number;
    /**
     * Returns the given timespan in a given unit.
     *
     * @param timeSpan Timespan in nanoseconds.
     * @param units    Unit to transform into.
     */
    static in(timeSpan: number, units: Units): number;
    /**
     * {@link #stop() Stop} this timer and log the {@link #getElapsedTotal()
     * total elapsed time} to the given logger instance, at level
     * {@link Level#FINE}.
     *
     * @param logger Logger to log to.
     * @param name   Name of event that was timed.
     * @param level  Level to log at.
     */
    log(logger: Logger | null, name: string, level?: Level): void;
    /**
     * Start the timer. Starting a running timer has no effect.
     */
    start(): void;
    /**
     * Stop the timer, record time passed since last start event. Stopping a
     * stopped timer has no effect.
     */
    stop(): void;
}
//# sourceMappingURL=Timer.d.ts.map