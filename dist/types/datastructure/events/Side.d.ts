import { Rectangle2D } from '../../java/Rectangle2D';
export declare function isSide(item: any): item is Side;
export declare class Side {
    static readonly TOP: Side;
    static readonly RIGHT: Side;
    static readonly BOTTOM: Side;
    static readonly LEFT: Side;
    private readonly _quadrants;
    private _others;
    private readonly _id;
    private static _values;
    private readonly _name;
    toString(): string;
    constructor(name: string, a: number, b: number, id: number);
    static interval(rect: Rectangle2D, side: Side): [number, number];
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
    static __quadrantIdx(index: number): [Side, Side];
    /**
     * Given a cell and a point in that cell, return the index of the quadrant
     * (order as per {@link #quadrant(int)}) that the point is in.
     */
    static __quadrantRXY(cell: Rectangle2D, x: number, y: number): number;
    /**
     * Given a quadrant as per {@link #quadrant(int)} and a side, return the
     * quadrant that lies to that side. Some combinations will be illegal,
     * in those cases garbage output is returned (as in, incorrect).
     */
    static quadrantNeighbor(index: number, side: Side): number;
    opposite(): Side;
    others(): [Side, Side, Side];
    /**
     * Returns the two quadrants on this side. For example, passing LEFT
     * will yield the indices of the top left and bottom left quadrants.
     * Indices as per {@link #quadrant(int)}.
     *
     * @return Indices of quadrants on given side.
     */
    quadrants(): [number, number];
    static values(): Side[];
    ordinal(): number;
}
//# sourceMappingURL=Side.d.ts.map