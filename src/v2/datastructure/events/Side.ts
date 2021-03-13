import { isRectangle2D, Rectangle2D } from '../../java/Rectangle2D';
import { isNumber } from '../../ts/validation';

export function isSide(item: any): item is Side {
  return item === null || item instanceof Side;
}

function isRNN(args: any[]): args is [Rectangle2D, number, number] {
  return (
    args.length > 2 &&
    isRectangle2D(args[0]) &&
    isNumber(args[1]) &&
    isNumber(args[2])
  );
}

export class Side {
  public static readonly TOP = new Side(0, 1, 0);
  public static readonly RIGHT = new Side(1, 3, 1);
  public static readonly BOTTOM = new Side(2, 3, 2);
  public static readonly LEFT = new Side(0, 2, 3);
  private readonly _quadrants: [number, number];
  private _others: [Side, Side, Side] | null;
  private _id: number;
  private static _values = [Side.TOP, Side.RIGHT, Side.BOTTOM, Side.LEFT];

  constructor(a: number, b: number, id: number) {
    this._id = id;
    this._others = null;
    this._quadrants = [a, b];
  }

  static interval(rect: Rectangle2D, side: Side): [number, number] {
    if (side == Side.TOP || side == Side.BOTTOM) {
      return [rect.getMinX(), rect.getMaxX()];
    }
    return [rect.getMinY(), rect.getMaxY()];
  }

  /**
   * Given an index of a quadrant as used in {@link QuadTree}, return a
   * descriptor of that quadrant.
   *
   * @param index Index of a quadrant. Quadrants are indexed as in the
   *              children of a {@link QuadTree}. That is, {@code [top left,
   *              top right, bottom left, bottom right]}.
   * @return A descriptor of the quadrant. This is simply an array with
   * two sides that together describe the quadrant.
   */
  static quadrant(index: number): [Side, Side];
  /**
   * Given a cell and a point in that cell, return the index of the quadrant
   * (order as per {@link #quadrant(int)}) that the point is in.
   */
  static quadrant(cell: Rectangle2D, x: number, y: number): number;
  static quadrant(
    ...args: [number] | [Rectangle2D, number, number]
  ): [Side, Side] | number {
    if (args.length > 0) {
      if (isNumber(args[0])) {
        return this.__quadrantIdx(args[0]);
      } else if (isRNN(args)) {
        return this.__quadrantRXY(...args);
      }
    }
    throw new Error('failed to resolve choice');
  }

  /**
   * Given an index of a quadrant as used in {@link QuadTree}, return a
   * descriptor of that quadrant.
   *
   * @param index Index of a quadrant. Quadrants are indexed as in the
   *              children of a {@link QuadTree}. That is, {@code [top left,
   *              top right, bottom left, bottom right]}.
   * @return A descriptor of the quadrant. This is simply an array with
   * two sides that together describe the quadrant.
   */
  static __quadrantIdx(index: number): [Side, Side] {
    if (index < 0 || index > 3) {
      throw new Error('illegal argument');
    }
    const descriptor: [Side, Side] = [null, null];
    let i = 0;
    for (const side of this.values()) {
      if (side._quadrants[0] == index || side._quadrants[1] == index) {
        descriptor[i++] = side;
      }
    }
    return descriptor;
  }

  /**
   * Given a cell and a point in that cell, return the index of the quadrant
   * (order as per {@link #quadrant(int)}) that the point is in.
   */
  static __quadrantRXY(cell: Rectangle2D, x: number, y: number): number {
    return (y < cell.getCenterY() ? 0 : 2) + (x < cell.getCenterX() ? 0 : 1);
  }

  /**
   * Given a quadrant as per {@link #quadrant(int)} and a side, return the
   * quadrant that lies to that side. Some combinations will be illegal,
   * in those cases garbage output is returned (as in, incorrect).
   */
  static quadrantNeighbor(index: number, side: Side): number {
    switch (index) {
      // top left quadrant
      case 0:
        return side.ordinal();
      // top right quadrant
      case 1:
        return (index + side.ordinal()) % 4;
      // bottom left quadrant
      case 2:
        return side == Side.TOP ? 0 : 3;
      // bottom right quadrant
      case 3:
        return side == Side.TOP ? 1 : 2;
      default:
        return -1;
    }
    // to make compiler happy
  }

  opposite(): Side {
    return Side.values()[(this.ordinal() + 2) % 4];
  }

  others(): [Side, Side, Side] {
    if (this._others == null) {
      this._others = [null, null, null];
      let i = 0;
      for (const that of Side.values()) {
        if (that !== this) {
          this.others[i++] = that;
        }
      }
    }
    return this._others;
  }

  /**
   * Returns the two quadrants on this side. For example, passing LEFT
   * will yield the indices of the top left and bottom left quadrants.
   * Indices as per {@link #quadrant(int)}.
   *
   * @return Indices of quadrants on given side.
   */
  public quadrants(): [number, number] {
    return this._quadrants;
  }

  static values() {
    return this._values;
  }

  ordinal() {
    return this._id;
  }
}
