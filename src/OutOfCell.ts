import { Event } from './Event';

export class OutOfCell extends Event {
  constructor() {
    super();
    throw new Error('To implement');
  }

  static Side = class Side {
    static TOP = new Side(0, 1);
    static RIGHT = new Side(1, 3);
    static BOTTOM = new Side(2, 3);
    static LEFT = new Side(0, 2);

    private static _VALUES = [Side.TOP, Side.RIGHT, Side.BOTTOM, Side.LEFT];

    static values() {
      return this._VALUES;
    }
    others: null;
    quadrants: number[];
    constructor(quadrant1: number, quadrant2: number) {
      this.others = null;
      this.quadrants = [quadrant1, quadrant2];
    }
  };
}

export const Side = OutOfCell.Side;
