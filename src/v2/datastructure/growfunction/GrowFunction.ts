import { Glyph, isGlyph } from '../Glyph';
import { isRectangle2D, Rectangle2D } from '../../java/Rectangle2D';
import { QuadTree } from '../QuadTree';
import { Side } from '../events/Side';
import { Utils } from '../../utils/Utils';

export class Shape extends Rectangle2D {
  static Double = class Double extends Shape {};

  getBounds2D(): Rectangle2D {
    return this;
  }
}

export class GrowFunction {
  /**
   * Returns the distance between two glyphs. This is the distance the glyphs
   * have to bridge before their borders will touch. Effectively, this method
   * returns the distance between their center points minus the widths of
   * their respective borders. The value returned by this method may be
   * negative in case the borders of glyphs overlap.
   *
   * @param a First glyph.
   * @param b Second glyph.
   */
  static dist(a: Glyph, b: Glyph): number;
  /**
   * Returns the minimum distance between a glyph and any point in the given
   * rectangle. This will in particular return {@link Double#NEGATIVE_INFINITY}
   * when the given glyph's center point is contained in the rectangle. It will
   * return a negative value when the border of a glyph overlaps the rectangle,
   * even when the glyph center point is right outside the rectangle.
   *
   * <p>As with {@link #dist(Glyph, Glyph)}, this method takes the border
   * width of the glyph into account. This means that it effectively returns
   * the minimum distance between the center point of the glyph and the
   * rectangle, minus the width of the glyph's border.
   *
   * @param rect Description of rectangle.
   * @param g    Glyph to consider.
   */
  static dist(rect: Rectangle2D, g: Glyph): number;
  static dist(a: Glyph | Rectangle2D, b: Glyph): number {
    if (a === null) throw Error('unable to resolve');

    if (isGlyph(a)) {
      return this.__distGlyphGlyph(a, b);
    } else if (isRectangle2D(a)) {
      return this.__distRectangleGlyph(a, b);
    }

    throw Error('unable to resolve');
  }

  /**
   * Returns the distance between two glyphs. This is the distance the glyphs
   * have to bridge before their borders will touch. Effectively, this method
   * returns the distance between their center points minus the widths of
   * their respective borders. The value returned by this method may be
   * negative in case the borders of glyphs overlap.
   *
   * @param a First glyph.
   * @param b Second glyph.
   */
  static __distGlyphGlyph(a: Glyph, b: Glyph): number {
    return Utils.euclidean(a.getX(), a.getY(), b.getX(), b.getY());
  }

  /**
   * Returns the minimum distance between a glyph and any point in the given
   * rectangle. This will in particular return {@link Double#NEGATIVE_INFINITY}
   * when the given glyph's center point is contained in the rectangle. It will
   * return a negative value when the border of a glyph overlaps the rectangle,
   * even when the glyph center point is right outside the rectangle.
   *
   * <p>As with {@link #dist(Glyph, Glyph)}, this method takes the border
   * width of the glyph into account. This means that it effectively returns
   * the minimum distance between the center point of the glyph and the
   * rectangle, minus the width of the glyph's border.
   *
   * @param rect Description of rectangle.
   * @param g    Glyph to consider.
   */
  static __distRectangleGlyph(rect: Rectangle2D, g: Glyph): number {
    const d = Utils.euclidean(rect, g.getX(), g.getY());
    if (d < 0) {
      return Number.NEGATIVE_INFINITY;
    }
    return d;
  }

  /**
   * Returns at which zoom level a glyph touches the given side of the given
   * cell. The glyph is scaled using this {@link GrowFunction}.
   *
   * @param glyph Growing glyph.
   * @param cell  Cell that glyph is assumed to be inside of, altough if not
   *              the time of touching is still correctly calculated.
   * @param side  Side of cell for which calculation should be done.
   * @return Zoom level at which {@code glyph} touches {@code side} side of
   * {@code cell}.
   */
  static exitAt(glyph: Glyph, cell: QuadTree, side: Side): number {
    return this.intersectAt(cell.getSide(side), glyph);
  }

  /**
   * Returns at which zoom level two glyphs will touch. Both glyphs are
   * scaled using this {@link GrowFunction}.
   *
   * @param a First glyph.
   * @param b Second glyph.
   * @return Zoom level at which {@code a} and {@code b} touch. Returns
   * {@link Double#NEGATIVE_INFINITY} if the two glyphs share coordinates.
   */
  static intersectAt(a: Glyph, b: Glyph): number;
  /**
   * Returns at which zoom level a glyph touches a static rectangle. The
   * glyph is scaled using this {@link GrowFunction}.
   *
   * @param r Static rectangle.
   * @param g Growing glyph.
   * @return Zoom level at which {@code r} and {@code glyph} touch. If the glyph
   * is contained in the rectangle, {@link Double#NEGATIVE_INFINITY} must be
   * returned. A negative value may still be returned in case the
   * {@code glyph} is right outside {@code r}, but its border overlaps it.
   */
  static intersectAt(r: Rectangle2D, g: Glyph): number;
  /**
   * Same as {@link #intersectAt(Rectangle2D, Glyph)}, just with different order
   * of parameters. This is a convenience function.
   */
  static intersectAt(glyph: Glyph, r: Rectangle2D): number;
  static intersectAt(a: Glyph | Rectangle2D, b: Glyph | Rectangle2D): number {
    if (a === null || b === null) {
      throw new Error('unable to resolve');
    }
    if (isGlyph(a) && isGlyph(b)) {
      return this.__intersectAtGlyphGlyph(a, b);
    } else if (isGlyph(a) && isRectangle2D(b)) {
      return this.__intersectAtGlyphRectangle(a, b);
    } else if (isRectangle2D(a) && isGlyph(b)) {
      return this.__intersectAtRectangleGlyph(a, b);
    }
    throw new Error('unable to resolve');
  }

  /**
   * Returns at which zoom level two glyphs will touch. Both glyphs are
   * scaled using this {@link GrowFunction}.
   *
   * @param a First glyph.
   * @param b Second glyph.
   * @return Zoom level at which {@code a} and {@code b} touch. Returns
   * {@link Double#NEGATIVE_INFINITY} if the two glyphs share coordinates.
   */
  static __intersectAtGlyphGlyph(a: Glyph, b: Glyph): number {
    if (a.hasSamePositionAs(b)) {
      return Number.NEGATIVE_INFINITY;
    }
    return this.dist(a, b) / (this.weight(a) + this.weight(b));
  }

  /**
   * Returns at which zoom level a glyph touches a static rectangle. The
   * glyph is scaled using this {@link GrowFunction}.
   *
   * @param r Static rectangle.
   * @param g Growing glyph.
   * @return Zoom level at which {@code r} and {@code glyph} touch. If the glyph
   * is contained in the rectangle, {@link Double#NEGATIVE_INFINITY} must be
   * returned. A negative value may still be returned in case the
   * {@code glyph} is right outside {@code r}, but its border overlaps it.
   */
  static __intersectAtRectangleGlyph(r: Rectangle2D, g: Glyph): number {
    const d = this.dist(r, g);
    if (!Number.isFinite(d)) {
      return d;
    }
    return d / this.weight(g);
  }

  /**
   * Same as {@link #intersectAt(Rectangle2D, Glyph)}, just with different order
   * of parameters. This is a convenience function.
   */
  static __intersectAtGlyphRectangle(glyph: Glyph, r: Rectangle2D): number {
    return this.intersectAt(r, glyph);
  }

  /**
   * Returns the radius of the given glyph at the given time stamp/zoom level.
   *
   * <p>The radius of a glyph is non-negative.
   *
   * @param g  Glyph to calculate radius of.
   * @param at Time stamp/zoom level to determine radius at.
   */
  static radius(g: Glyph, at: number): number {
    return Math.max(0, at) * this.weight(g);
  }

  static sizeAt(g: Glyph, at: number): Shape {
    const r = this.radius(g, at);
    return new Shape.Double(g.getX() - r, g.getY() - r, 2 * r, 2 * r);
  }

  /**
   * Given a glyph, return the weight of that glyph. This will normally be the
   * number of entities represented by the glyph, but it may be multiplied by
   * a compression factor if thresholds have been added and apply.
   *
   * @param glyph Glyph to read weight of.
   */
  static weight(glyph: Glyph): number {
    return Math.sqrt(glyph.getN());
  }
}
