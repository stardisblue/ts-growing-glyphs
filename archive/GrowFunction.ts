import {Glyph} from "./Glyph";
import {QuadTree} from "./QuadTree";
import {Rectangle2D} from "./Rectangle2D";
import {Utils} from "./Utils";
import {Side} from "./OutOfCell";

export class GrowFunction {

    static exitAt(glyph: Glyph, cell: QuadTree, side: Side) {
        return this.intersectAt(cell.getSide(side), glyph);
    }

    private static intersectAt(r: Rectangle2D, g: Glyph) {
        const d = this.dist(r, g);
        if (!Number.isFinite(d)) {
            return d;
        }
        return d / this.weight(g);
    }

    private static dist(rect: Rectangle2D, g: Glyph) {
        const d = Utils.euclidean(rect, g.x, g.y);
        if (d < 0) {
            return Number.NEGATIVE_INFINITY;
        }
        return d;
    }

    private static weight(glyph: Glyph) {
        return Math.sqrt(glyph.n);
    }

    static intersectAtG(a: Glyph, b: Glyph) {
        if (a.hasSamePositionAs(b)) {
            return Number.NEGATIVE_INFINITY;
        }
        return this.distG(a, b) / (this.weight(a) + this.weight(b));
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
    private static distG(a: Glyph, b: Glyph) {
        return Utils.euclidean2(a.x, a.y, b.x, b.y);
    }
}