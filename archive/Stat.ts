export class Stat {
    n: number;
    average: number;
    min: number;
    max: number;
    sum: number;

    constructor(value: number = 0) {
        this.n = 1;
        this.average = this.min = this.max = this.sum = value;
    }

    record(value: number) {
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
}
