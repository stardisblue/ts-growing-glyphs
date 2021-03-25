import { Logger } from '../java/Logger';
export declare class Stat {
    private n;
    private average;
    private min;
    private max;
    private sum;
    constructor(value?: number);
    /**
     * @deperecated use #average
     */
    getAverage(): number;
    /**
     * @deperecated use #min
     */
    getMin(): number;
    /**
     * @deperecated use #max
     */
    getMax(): number;
    /**
     * @deperecated use #n
     */
    getN(): number;
    /**
     * @deperecated use #sum
     */
    getSum(): number;
    log(logger: Logger, name: string): void;
    logCount(logger: Logger, name: string): void;
    logPercentage(logger: Logger, name: string): void;
    record(value: number): void;
    /**
     * Forget about the given value. This method will update the average and sum
     * that are recorded, while the minimum and maximum are invalidated (become
     * {@link Double#NaN}). It is <i>not</i> checked whether the given value has
     * been recorded before, because values are not tracked explicitly.
     *
     * @param value Value to forget about.
     * @throws IllegalStateException When the number of recorded values is 0.
     */
    unrecord(value: number): void;
}
//# sourceMappingURL=Stat.d.ts.map