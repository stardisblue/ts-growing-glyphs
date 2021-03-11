export class Point2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * @deprecated use x */
    getX(): number {
        return this.x;
    }

    /**
     * @deprecated use y
     */
    getY(): number {
        throw new Error("Method not implemented.");
    }
}
