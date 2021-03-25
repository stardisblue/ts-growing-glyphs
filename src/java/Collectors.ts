import { ArrayList } from './ArrayList';
import {HashSet} from "./HashSet";

export class Collectors {
  /**
   * @deprecated useless in js
   * @param create
   */
  static toCollection<T, R extends ArrayList<T>>(
    create: (list: T[]) => R
  ): (list: T[]) => R {
    return create;
  }

  static toList() {
    return function <T>(p1: T[]) {
      return p1;
    };
  }

  static toSet(){
    return function <T>(items: T[]): T[] {
      return Array.from<T>(new HashSet<T>(items));
    };
  }
}
