export declare function isRectangle2D(item: any): item is Rectangle2D;
export declare class Rectangle2D {
    private readonly x;
    private readonly y;
    private readonly width;
    private readonly height;
    constructor(x: number, y: number, w: number, h: number);
    /**
     * @deprecated use #x
     */
    getX(): number;
    /**
     * @deprecated use #width
     */
    getWidth(): number;
    /**
     * @deprecated use #y
     */
    getY(): number;
    /**
     * @deprecated use #height
     */
    getHeight(): number;
    getMinX(): number;
    getMaxX(): number;
    getMinY(): number;
    getMaxY(): number;
    contains(x: number, y: number): boolean;
    getCenterX(): number;
    getCenterY(): number;
}
//# sourceMappingURL=Rectangle2D.d.ts.map