import TinyQueue from "tinyqueue";
import {Comparable} from "./Comparable";

export class PriorityQueue<T extends Comparable<any>> {
  private __internal: TinyQueue<T>;

  constructor(n?: number) {
    this.__internal = new TinyQueue<T>([], (a, b) => a.compareTo(b));
  }

  add(merge: T): boolean {
    this.__internal.push(merge);
    return true;
  }

  peek(): T {
    return this.__internal.peek();
  }

  poll(): T {
    return this.__internal.pop();
  }

  size(): number {
    return this.__internal.length;
  }

  isEmpty() {
    return this.__internal.length === 0;
  }
}
