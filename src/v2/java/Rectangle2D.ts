export function isRectangle2D(item: any): item is Rectangle2D {
  return item === null || item instanceof Rectangle2D;
}

export class Rectangle2D {
  private readonly x: number;
  private readonly y: number;
  private readonly width: number;
  private readonly height: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
  }

  static Double = class Double extends Rectangle2D {};

  /**
   * @deprecated use #x
   */
  getX() {
    return this.x;
  }

  /**
   * @deprecated use #width
   */
  getWidth() {
    return this.width;
  }

  /**
   * @deprecated use #y
   */
  getY() {
    return this.y;
  }

  /**
   * @deprecated use #height
   */
  getHeight() {
    return this.height;
  }

  getMinX() {
    return this.x;
  }

  getMaxX() {
    return this.x + this.width;
  }

  getMinY() {
    return this.y;
  }

  getMaxY() {
    return this.y + this.height;
  }

  contains(x: number, y: number) {
    const x0 = this.getX();
    const y0 = this.getY();
    return (
      x >= x0 &&
      y >= y0 &&
      x < x0 + this.getWidth() &&
      y < y0 + this.getHeight()
    );
  }

  getCenterX() {
    return this.getX() + this.getWidth() / 2.0;
  }

  getCenterY() {
    return this.getY() + this.getHeight() / 2.0;
  }
}
