export class Comparator {

    static comparingInt<T>(callback: (value: T) => number) {
        return function (a: T, b: T) {
            return callback(a) - callback(b);
        };
    }

    static comparing<T>(callback: (a: T) => string) {
        return function (a: T, b: T) {
            const a0 = callback(a);
            const b0 = callback(b);
            return a0 < b0 ? -1 : a0 > b0 ? 1 : 0;
        };
    }
}