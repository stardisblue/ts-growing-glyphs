import { Units } from './Utils';
import { Level, Logger } from '../java/Logger';
import { System } from '../java/System';
import {Constants} from "./Constants";

export class Timer {
  private count: number;
  private running: boolean;
  private started: number;
  private totalElapsed: number;

  /**
   * Construct a new timer, and immediately start it.
   */
  constructor() {
    this.count = 0;
    this.totalElapsed = 0;
    this.running = false
    this.started = null as any
    this.start();
  }

  /**
   * Returns a timestamp that can be used to measure elapsed time.
   */
  static now(): number {
    if(typeof process === "object") {
      const [seconds, nano] = process.hrtime();
      return seconds * 10e9 + nano;
    }
    else return performance.now()

  }

  /**
   * Returns how much time passed since this timer was last started.
   */
  getElapsed(): number {
    return Timer.now() - this.started;
  }

  /**
   * Returns how much time has passed between all start and stop events on
   * this timer. When the timer is currently running, that time is <em>not</em>
   * included in this value.
   */
  public getElapsedTotal(): number {
    return this.totalElapsed;
  }

  /**
   * Returns how many times this timer was stopped.
   */
  public getNumCounts(): number {
    return this.count;
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
   * {@link #stop() Stop} this timer and log the {@link #getElapsedTotal()
   * total elapsed time} to the given logger instance, at level
   * {@link Level#FINE}.
   *
   * @param logger Logger to log to.
   * @param name   Name of event that was timed.
   * @param level  Level to log at.
   */
  public log(logger: Logger | null, name: string, level: Level = Level.FINE): void {
    this.stop();
    if (Constants.LOGGING_ENABLED && logger !== null) {
      logger.log(
        level,
        `${name} took ${Timer.in(this.totalElapsed, Units.SECONDS)
          .toFixed(2)
          .padStart(5)} seconds (wall clock time${
          this.count === 1 ? '' : `, ${this.count} timings`
        }`
      );
      // logger.log(level, "{0} took {1} seconds (wall clock time{2})",
      //     new Object[]{name, String.format("%5.2f", Timers.in(
      //     totalElapsed, Units.SECONDS)),
      //     (this.count == 1 ? "" : String.format(", %s timings",
      //         NumberFormat.getIntegerInstance().format(count)))});
    } else {
      System.out.println(
        `${name} took ${Timer.in(this.totalElapsed, Units.SECONDS)
          .toFixed(3)
          .padStart(5)} seconds (wall clock time${
          this.count === 1 ? '' : `, ${this.count} timings`
        }`
      );
      // System.out.println(String.format(
      //     "%1$s took %2$5.3f seconds (wall clock time%3$s",
      //     name, Timers.in(totalElapsed, Units.SECONDS),
      //     (count == 1 ? "" : String.format(", %s timings",
      //         NumberFormat.getIntegerInstance().format(count)))
      // ));
    }
  }

  /**
   * Start the timer. Starting a running timer has no effect.
   */
  start(): void {
    if (this.running) {
      return;
    }
    this.started = Timer.now();
    this.running = true;
  }

  /**
   * Stop the timer, record time passed since last start event. Stopping a
   * stopped timer has no effect.
   */
  stop(): void {
    if (!this.running) {
      return;
    }
    this.totalElapsed += this.getElapsed();
    this.count++;
    this.running = false;
  }
}
