import {Collectors} from "./Collectors";

export class ArrayList<T> implements Iterable<T> {
  __internal: T[];

  toString() {
    return `[${this.__internal.join(", ")}]`;
  }

  static __new<T>(list: T[]) {
    const arr = new ArrayList<T>();
    arr.__internal = list;
    return arr;
  }

  constructor(size?: number) {
    this.__internal = [];
  }

  addI(index: number, value: T) {
    this.__internal.splice(index, 0, value);
  }

  add(value: T) {
    this.__internal.push(value);
    return true;
  }

  addAll(values: T[]) {
    return this.__internal.length === this.__internal.push(...values);
  }

  [Symbol.iterator](): Iterator<T> {
    return this.__internal[Symbol.iterator]();
  }

  get length() {
    return this.__internal.length;
  }

  clear() {
    this.__internal = [];
  }

  /**
   * @deprecated useless in js
   */
  stream() {
    return new Stream(this.__internal);
  }

  get(index: number) {
    return this.__internal[index];
  }

  contains(glyph: T) {
    return this.__internal.includes(glyph);
  }

  size() {
    return this.__internal.length;
  }

  isEmpty() {
    return this.__internal.length === 0;
  }

  removeI(index: number) {
    if (index === -1) {
      throw new Error("IndexOutOfBoundsException");
    }
    const [item] = this.__internal.splice(index, 1);
    return item;
  }

  remove(item: T) {
    const index = this.__internal.indexOf(item);
    if (index === -1) {
      return false;
    }
    this.__internal.splice(index, 1);
    return true;
  }

  set(index: number, item: T) {
    const old = this.__internal[index];
    if (old === undefined) {
      throw new Error("OutOfBoundException");
    }
    this.__internal[index] = item;
    return old;
  }

  poll(): T {
    return this.__internal.shift();
  }

  pollLast() {
    return this.__internal.pop();
  }

  getLast() {
    return this.__internal[this.__internal.length - 1];
  }

  addFirst(item: T) {
    return this.__internal.unshift(item);
  }

  sort(comparator?: (hc1: T, hc2: T) => number) {
    return this.__internal.sort(comparator);
  }

  toArray<R = T>(cb: (T) => R = v => v) {
    return Array.from(this.__internal, cb);
  }

  copy() {
    return ArrayList.__new(Array.from(this.__internal));
  }
}

class Optional<K> {
  private readonly value: K;

  constructor(value: K) {
    this.value = value;
  }

  get() {
    if (this.value === null) {
      throw new Error("null pointer exception XD");
    }
    return this.value;
  }
}

export class Stream<T> {
  protected __internal: T[];

  constructor(array: T[]) {
    this.__internal = array;
  }

  get length() {
    return this.__internal.length;
  }

  filter(callbackfn: (item: T, index: number, arr: T[]) => boolean) {
    this.__internal = this.__internal.filter(callbackfn);
    return this;
  }

  collect<R>(toCollection: (array: T[]) => R) {
    return toCollection(this.__internal);
  }

  map<R>(callbackfn: (item: T, index: number, arr: T[]) => R) {
    return new Stream(this.__internal.map(callbackfn));
  }

  mapToInt(callbackfn: (item: T, index: number, arr: T[]) => number) {
    return new NumberStream(this.__internal.map(callbackfn));
  }

  max(comparator: (a: T, b: T) => number): Optional<T> {
    const result = this.__internal.reduce((max, item) => {
      if (max === null) return item;
      const result = comparator(max, item);
      // max < item
      if (result < 0) return item;
      return max;
    }, null);
    return new Optional<T>(result);
  }

  sorted(comparator: (a: T, b: T) => number) {
    this.__internal.sort(comparator);
    return this;
  }

  toArray() {
    return this.__internal;
  }

  forEach(callbackfn: (value: T, index: number, array: T[]) => void) {
    this.__internal.forEach(callbackfn);
  }

  parallel() {
    return this;
  }

  flatMap<R>(callbackfn?: (value: T, index: number, array: T[]) => R[]) {
    return new Stream(this.__internal.flatMap(callbackfn));
  }

  iterator() {
    return this.__internal.values();
  }

  distinct() {
    return new Stream(this.collect(Collectors.toSet()));
  }
}

class NumberStream extends Stream<number> {
  sum() {
    return this.__internal.reduce((sum, value) => sum + value, 0);
  }
}
