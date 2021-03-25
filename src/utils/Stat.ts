import { Level, Logger } from '../java/Logger';

export class Stat {
  private n: number;
  private average: number;
  private min: number;
  private max: number;
  private sum: number;

  constructor(value?: number) {
    if (value === undefined) {
      this.n = 0;
    } else {
      this.n = 1;
      this.average = this.min = this.max = this.sum = value;
    }
  }

  /**
   * @deperecated use #average
   */
  getAverage(): number {
    return this.average;
  }

  /**
   * @deperecated use #min
   */
  getMin(): number {
    return this.min;
  }

  /**
   * @deperecated use #max
   */
  getMax(): number {
    return this.max;
  }

  /**
   * @deperecated use #n
   */
  getN(): number {
    return this.n;
  }

  /**
   * @deperecated use #sum
   */
  getSum(): number {
    return this.sum;
  }

  log(logger: Logger, name: string): void {
    if (this.min === this.max) {
      logger.log(
        Level.FINE,
        `${name} was ${this.max.toFixed(2).padStart(13)} and did not change over ${
          this.n
        } measurement${this.n === 1 ? '' : 's'}`
      );
    } else {
      logger.log(
        Level.FINE,
        `${name} was ${this.average.toFixed(2).padStart(13)} on average and always between ${
          this.min
        } and ${this.max} over ${this.n} measurement${this.n === 1 ? '' : 's'}`
      );
    }
  }

  logCount(logger: Logger, name: string): void {
    logger.log(
      Level.FINE,
      `${name} occured ${this.n === 1 ? 'once' : this.n + ' times'}`
    );
  }

  logPercentage(logger: Logger, name: string): void {
    logger.log(
      Level.FINE,
      `${name} ${(this.average * 100).toFixed(2)}% of the time`
    );
  }

  record(value: number): void {
    if (this.n === 0) {
      this.n = 1;
      this.average = this.min = this.max = this.sum = value;
      return;
    }
    this.average += (value - this.average) / ++this.n;
    this.sum += value;
    if (value > this.max) {
      this.max = value;
    }
    if (value < this.min) {
      this.min = value;
    }
  }

  /**
   * Forget about the given value. This method will update the average and sum
   * that are recorded, while the minimum and maximum are invalidated (become
   * {@link Double#NaN}). It is <i>not</i> checked whether the given value has
   * been recorded before, because values are not tracked explicitly.
   *
   * @param value Value to forget about.
   * @throws IllegalStateException When the number of recorded values is 0.
   */
  unrecord(value: number): void {
    if (this.n === 0) {
      throw new Error(
        'cannot unrecord a value when no ' + 'values are recorded'
      );
    }
    this.average -= (value - this.average) / --this.n;
    this.sum -= value;
    this.min = this.max = Number.NaN;
  }
}
