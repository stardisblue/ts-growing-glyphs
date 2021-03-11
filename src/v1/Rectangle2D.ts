export class Rectangle2D {
    x: number;
    y: number;
    width: number;
    height: number;

    /**
     *
     * @param x the X coordinate of the upper-left corner of the newly constructed Rectangle2D
     * @param y  the Y coordinate of the upper-left corner of the newly constructed Rectangle2D
     * @param w the width of the newly constructed Rectangle2D
     * @param h the height of the newly constructed Rectangle2D
     */
    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }

    getCenterY() {
        return this.y + this.height / 2;
    }

    getCenterX() {
        return this.x + this.width / 2;
    }

    getMaxX(): number {
        return this.x + this.width;
    }

    getMinY(): number {
        return this.y;
    }

    getMaxY(): number {
        return this.y + this.height;
    }

    getMinX(): number {
        return this.x;
    }

    /**
     * @deprecated use {@link width} instead
     */
    getWidth() {
        return this.width;
    }

    /**
     * @deprecated use {@link height} instead
     */
    getHeight() {
        return this.height;
    }

    contains(x: number, y: number) {
        const x0 = this.x;
        const y0 = this.y;
        return x >= x0 && y >= y0 && x < x0 + this.width && y < y0 + this.height;
    }
}
