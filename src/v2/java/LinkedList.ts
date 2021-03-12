import List from 'collections/list';

export class LinkedList<T> {
  private __internal = new List();

  add(item: T) {
    return this.__internal.push(item);
  }

  isEmpty(): boolean {
    return this.__internal.length === 0;
  }

  poll(): T {
    return this.__internal.shift();
  }

  addAll(values: T[]) {
    return this.__internal.push(...values);
  }
}
