import {Level, Logger} from './Logger';
import {Timers, TimersUnits} from './Utils';

export class Timer {
    totalElapsed: number;
    count: number;
    running: any;
    started: number | null = null;

    constructor() {
        this.count = 0;
        this.totalElapsed = 0;
        this.start();
    }

    start() {
        if (this.running) {
            return;
        }
        this.started = Timers.now();
        this.running = true;
    }

    log(logger: Logger | null, name: string, level: Level) {
        this.stop();
        if (logger !== null) {
            logger.log(
                level,
                `${name} took ${Timers.in(
                    this.totalElapsed,
                    TimersUnits.SECONDS
                )} seconds (wall clock time${
                    this.count === 1 ? '' : `, ${this.count} timings`
                })`
            );
        } else {
            console.log(
                `${name} took ${Timers.in(
                    this.totalElapsed,
                    TimersUnits.SECONDS
                )} seconds (wall clock time ${
                    this.count === 1 ? '' : `, ${this.count}`
                })`
            );
        }
    }

    stop() {
        if (!this.running) {
            return;
        }
        this.totalElapsed += this.getElapsed();
        this.count++;
        this.running = false;
    }

    getElapsed() {
        return Timers.now() - this.started!;
    }
}
