import { Rectangle2D } from "../java/Rectangle2D";
import { ArrayList } from "../java/ArrayList";
import { Glyph } from "./Glyph";
import { Side } from "./events/Side";
export declare class QuadTree implements Iterable<QuadTree> {
    /**
     * Rectangle describing this cell.
     */
    private readonly cell;
    /**
     * Parent pointer. Will be {@code null} for the root cell.
     */
    private parent;
    /**
     * Whether {@link #parent} thinks {@code this} is a child of it. The root
     * cell can never be an orphan, because it does not have a parent.
     */
    private _isOrphan;
    /**
     * Child cells, in the order: top left, top right, bottom left, bottom right.
     * Will be {@code null} for leaf cells.
     */
    children: [QuadTree, QuadTree, QuadTree, QuadTree] | null;
    /**
     * Glyphs intersecting the cell.
     */
    glyphs: ArrayList<Glyph> | null;
    /**
     * Cache {@link #getNeighbors(Side)} for every side, but only for leaves.
     */
    private readonly neighbors;
    /**
     * Construct a rectangular QuadTree cell at given coordinates.
     *
     * @param x X-coordinate of top left corner of cell.
     * @param y Y-coordinate of top left corner of cell.
     * @param w Width of cell.
     * @param h Height of cell.
     */
    constructor(x: number, y: number, w: number, h: number);
    /**
     * Reset to being a cell without glyphs nor children.
     * @Deprecated
     */
    clear(): void;
    /**
     * Returns whether the given point is contained in this QuadTree cell. This
     * is true when the following conditions are satisfied:
     * - cell.minX <= x; and
     * - cell.minY <= y; and
     * - x < cell.maxX or x == root.maxX; and
     * - y < cell.maxY or y == root.maxY.
     * The above ensures that only a single cell at each level of the QuadTree
     * will contain any given point, while simultaneously all points in the
     * bounding box of the QuadTree are claimed by a cell at every level.
     *
     * @param x X-coordinate of query point.
     * @param y Y-coordinate of query point.
     */
    contains(x: number, y: number): boolean;
    /**
     * @deprecated use {@link glyphs} instead
     */
    getGlyphs(): ArrayList<Glyph>;
    getGlyphsAlive(): ArrayList<Glyph>;
    getHeight(): number;
    getLeaves(): ArrayList<QuadTree>;
    /**
     * Returns a set of all QuadTree cells that are descendants of this cell,
     * {@link #isLeaf() leaves} and have one side touching the {@code side}
     * border of this cell.
     *
     * @param side Side of cell to find leaves on.
     */
    getLeaves(side: Side): ArrayList<QuadTree>;
    /**
     * Add all leaf cells on the given side of the current cell to the given
     * set. If this cell is a leaf, it will add itself as a whole.
     *
     * @param side   Side of cell to take leaves on.
     * @param result Set to add cells to.
     */
    getLeaves(side: Side, result: ArrayList<QuadTree>): void;
    /**
     * Add all leaf cells on the given side of the current cell to the given
     * set that intersect the range defined by extending the given rectangle to
     * the given side and its opposite direction infinitely far.
     *
     * @see QuadTree#getLeaves(Side, ArrayList)
     */
    getLeaves(side: Side, range: Rectangle2D, result: ArrayList<QuadTree>): void;
    /**
     * Returns a set of all QuadTree cells that are descendants of this cell,
     * {@link #isLeaf() leaves} and intersect the given rectangle.
     *
     * @param rectangle The query rectangle.
     */
    getLeaves(rectangle: Rectangle2D): ArrayList<QuadTree>;
    /**
     * Add all leaf cells intersecting the given rectangle to the given set. If
     * this cell is a leaf, it will add itself as a whole.
     *
     * @param rectangle Query rectangle.
     * @param result    Set to add cells to.
     */
    getLeaves(rectangle: Rectangle2D, result: ArrayList<QuadTree>): void;
    /**
     * Return a set of all leaves of this QuadTree that intersect the given
     * glyph at the given point in time.
     *
     * @param glyph The glyph to consider.
     * @param at    Timestamp/zoom level at which glyph size is determined.
     * @see #insert(Glyph, double)
     */
    getLeaves(glyph: Glyph, at: number): ArrayList<QuadTree>;
    /**
     * Actual implementation of {@link #getLeaves(Glyph,number)}.
     */
    getLeaves(glyph: Glyph, at: number, result: ArrayList<QuadTree>): void;
    __getLeaves(): ArrayList<QuadTree>;
    /**
     * Returns a set of all QuadTree cells that are descendants of this cell,
     * {@link #isLeaf() leaves} and have one side touching the {@code side}
     * border of this cell.
     *
     * @param side Side of cell to find leaves on.
     */
    __getLeavesSide(side: Side): ArrayList<QuadTree>;
    /**
     * Returns a set of all QuadTree cells that are descendants of this cell,
     * {@link #isLeaf() leaves} and intersect the given rectangle.
     *
     * @param rectangle The query rectangle.
     */
    __getLeavesRectangle(rectangle: Rectangle2D): ArrayList<QuadTree>;
    /**
     * Return a set of all leaves of this QuadTree that intersect the given
     * glyph at the given point in time.
     *
     * @param glyph The glyph to consider.
     * @param at    Timestamp/zoom level at which glyph size is determined.
     * @see #insert(Glyph, double)
     */
    __getLeavesGlyphAt(glyph: Glyph, at: number): ArrayList<QuadTree>;
    /**
     * Return a set of the neighboring cells on the given side of this cell.
     *
     * @param side Side of cell to find neighbors on.
     */
    getNeighbors(side: Side): ArrayList<QuadTree>;
    /**
     * Returns the first ancestor (parent, grandparent, ...) that is <i>not</i>
     * an {@link #isOrphan() orphan}. In case this node is not an orphan, this
     * will return a self reference.
     */
    getNonOrphanAncestor(): QuadTree;
    getParent(): QuadTree;
    getRectangle(): Rectangle2D;
    getRoot(): QuadTree;
    getSide(side: Side): Rectangle2D;
    /**
     * Returns the number of cells that make up this QuadTree.
     */
    getSize(): number;
    /**
     * Returns the maximum number of links that need to be followed before a
     * leaf cell is reached.
     */
    getTreeHeight(): number;
    getWidth(): number;
    getX(): number;
    getY(): number;
    /**
     * Insert a given glyph into all cells of this QuadTree it intersects. This
     * method does not care about {@link QuadTree}.
     *
     * @param glyph The glyph to insert.
     * @param at    Timestamp/zoom level at which insertion takes place.
     * @return In how many cells the glyph has been inserted.
     * @see #getLeaves(Glyph, double)
     */
    insert(glyph: Glyph, at: number): number;
    /**
     * Insert a given glyph into this QuadTree, but treat it as only its center
     * and handle the insertion as a regular QuadTree insertion. This means that
     * a split may be triggered by this insertion, in order to maintain the
     * maximum capacity of cells.
     *
     * @param glyph The glyph center to insert.
     * @return Whether center has been inserted.
     */
    insertCenterOf(glyph: Glyph): boolean;
    /**
     * Returns whether this cell is an orphan, which it is when its parent has
     * joined and forgot about its children.
     */
    isOrphan(): boolean;
    /**
     * Returns whether this cell has child cells.
     */
    isLeaf(): boolean;
    isRoot(): boolean;
    /**
     * {@inheritDoc}
     * <p>
     * This iterator will iterate over all cells of the QuadTree in a top-down
     * manner: first a node, then its children.
     * @deprecated
     * @use Symbol.iterator
     */
    iterator(): Iterator<QuadTree>;
    [Symbol.iterator](): Iterator<QuadTree>;
    /**
     * Returns an iterator over all alive glyphs in this QuadTree.
     */
    iteratorGlyphsAlive(): IterableIterator<Glyph>;
    /**
     * Remove the given glyph from this cell, if it is associated with it.
     * This method does <i>not</i> remove the cell from the glyph.
     *
     * @param glyph Glyph to be removed.
     * @param at    Time/zoom level at which glyph is removed. Used only to
     *              record when a join took place, if a join is triggered.
     * @return Whether removing the glyph caused this cell to merge with its
     * siblings into its parent, making this cell an
     * {@link #isOrphan() orphan}. If this happens, merge events may
     * need to be updated and out of cell events may be outdated.
     */
    removeGlyph(glyph: Glyph, at: number): boolean;
    /**
     * Performs a regular QuadTree split, treating all glyphs associated with
     * this cell as points, namely their centers. Distributes associated glyphs
     * to the relevant child cells.
     *
     * @see #split(double)
     * @deprecated
     */
    split(): void;
    /**
     * Split this cell in four and associate glyphs in this cell with the child
     * cells they overlap.
     *
     * @param at Timestamp/zoom level at which split takes place.
     * @see #split()
     * @deprecated
     */
    split(at: number): void;
    /**
     * Performs a regular QuadTree split, treating all glyphs associated with
     * this cell as points, namely their centers. Distributes associated glyphs
     * to the relevant child cells.
     *
     * @see #split(double)
     */
    __split(): void;
    /**
     * Split this cell in four and associate glyphs in this cell with the child
     * cells they overlap.
     *
     * @param at Timestamp/zoom level at which split takes place.
     * @see #split()
     */
    __splitAt(at: number): void;
    toString(): string;
    /**
     * Actual implementation of {@link #getLeaves(Glyph, double)}.
     */
    private __getLeavesGlyphAtResult;
    /**
     * Add all leaf cells on the given side of the current cell to the given
     * set. If this cell is a leaf, it will add itself as a whole.
     *
     * @param side   Side of cell to take leaves on.
     * @param result Set to add cells to.
     */
    __getLeavesSideResult(side: Side, result: ArrayList<QuadTree>): void;
    /**
     * Add all leaf cells intersecting the given rectangle to the given set. If
     * this cell is a leaf, it will add itself as a whole.
     *
     * @param rectangle Query rectangle.
     * @param result    Set to add cells to.
     */
    __getLeavesRectangleResult(rectangle: Rectangle2D, result: ArrayList<QuadTree>): void;
    /**
     * Add all leaf cells on the given side of the current cell to the given
     * set that intersect the range defined by extending the given rectangle to
     * the given side and its opposite direction infinitely far.
     *
     * @see QuadTree#getLeaves(Side, ArrayList)
     */
    __getLeavesSideRectangleResult(side: Side, range: Rectangle2D | null, result: ArrayList<QuadTree>): void;
    /**
     * If the total number of glyphs of all children is at most
     * and those children are leaves, delete the
     * children (thus making this cell a leaf), and adopt the glyphs of the
     * deleted children in this cell.
     *
     * @param at Time/zoom level at which join takes place. Used only to record
     *           when a join happened, if one is triggered.
     * @return Whether a join was performed.
     */
    joinMaybe(at: number): boolean;
    /**
     * If not a leaf yet, create child cells and associate them with this cell
     * as being their parent. This method does <em>not</em> reassign any glyphs
     * associated with this cell to children.
     * <p>
     * The {@link #neighbors} of the newly created child cells will be
     * initialized correctly. The {@link #neighbors} of this cell will be
     * cleared - only leaf cells maintain who their neighbors are.
     *
     * @see #split()
     * @see #split(double)
     */
    private splitCell;
}
//# sourceMappingURL=QuadTree.d.ts.map