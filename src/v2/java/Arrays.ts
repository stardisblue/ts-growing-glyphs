import { ArrayList, Stream } from './ArrayList';

export class Arrays {
  static asList<T>(array: T[]) {
    return array;
  }

  static stream<T>(items: T[], from: number, upto: number) {
    return new Stream(items.splice(from, upto));
  }

  static nCopies(length: number, value: number) {
    return Array.from({ length }, () => value);
  }

  static rotate<T>(arr: ArrayList<T>, count: number) {
    count -= arr.__internal.length * Math.floor(count / arr.__internal.length);
    arr.__internal.push.apply(arr.__internal, arr.__internal.splice(0, count));
    return arr;
  }
}
