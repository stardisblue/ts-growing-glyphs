export class HashSet<T> implements Iterable<T>{
  private readonly __internal;

  constructor(values: T[] = null) {
    this.__internal = new Set<T>(values)
  }

  add(item: T): boolean {
    if (this.__internal.has(item)) {
      return false;
    }
    this.__internal.add(item);

    return true;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.__internal[Symbol.iterator]();
  }
}