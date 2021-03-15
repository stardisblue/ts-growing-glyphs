/**
 * A QuadTree implementation that can track growing glyphs.
 *
 * @see Glyph
 */
import {Constants} from "../utils/Constants";
import {isRectangle2D, Rectangle2D} from "../java/Rectangle2D";
import {ArrayList} from "../java/ArrayList";
import {Glyph, isGlyph} from "./Glyph";
import {isSide, Side} from "./events/Side";
import {Stats, Timers, Utils} from "../utils/Utils";
import {Arrays} from "../java/Arrays";
import {GrowFunction} from "./growfunction/GrowFunction";
import {LinkedList} from "../java/LinkedList";
import {ArrayDeque} from "../java/ArrayDeque";

function isArrayList<T>(item: any): item is ArrayList<T> {
  return item instanceof ArrayList;
}

export class QuadTree implements Iterable<QuadTree> {
  /**
   * Rectangle describing this cell.
   */
  private readonly cell: Rectangle2D;

  /**
   * Parent pointer. Will be {@code null} for the root cell.
   */
  private parent: QuadTree | null;
  /**
   * Whether {@link #parent} thinks {@code this} is a child of it. The root
   * cell can never be an orphan, because it does not have a parent.
   */
  private _isOrphan: boolean;
  /**
   * Child cells, in the order: top left, top right, bottom left, bottom right.
   * Will be {@code null} for leaf cells.
   */
  children: [QuadTree, QuadTree, QuadTree, QuadTree] | null;
  /**
   * Glyphs intersecting the cell.
   */
  public glyphs: ArrayList<Glyph> | null;
  /**
   * Cache {@link #getNeighbors(Side)} for every side, but only for leaves.
   */
  private readonly neighbors: ArrayList<ArrayList<QuadTree>>;

  /**
   * Construct a rectangular QuadTree cell at given coordinates.
   *
   * @param x X-coordinate of top left corner of cell.
   * @param y Y-coordinate of top left corner of cell.
   * @param w Width of cell.
   * @param h Height of cell.
   */
  constructor(x: number, y: number, w: number, h: number) {
    this.cell = new Rectangle2D.Double(x, y, w, h);
    this.parent = null;
    this._isOrphan = false;
    this.children = null;
    this.glyphs = new ArrayList(Constants.MAX_GLYPHS_PER_CELL);
    this.neighbors = new ArrayList(Side.values().length);
    for (const _side of Side.values()) {
      this.neighbors.add(new ArrayList());
    }
  }

  /**
   * Reset to being a cell without glyphs nor children.
   * @Deprecated
   */
  clear() {
    if (this.children !== null) {
      for (const child of this.children) {
        child.clear();
      }
      this.children = null;
    }
    if (this.glyphs !== null) {
      for (const glyph of this.glyphs) {
        glyph.removeCell(this);
      }
      this.glyphs.clear();
    } else {
      this.glyphs = new ArrayList(Constants.MAX_GLYPHS_PER_CELL);
    }
    for (const neighborsOnSide of this.neighbors) {
      neighborsOnSide.clear();
    }
  }

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
  public contains(x: number, y: number) {
    const root = this.getRoot();
    return (
      this.cell.getMinX() <= x &&
      this.cell.getMinY() <= y &&
      (x < this.cell.getMaxX() || x == root.cell.getMaxX()) &&
      (y < this.cell.getMaxY() || y == root.cell.getMaxY())
    );
  }

  /**
   * @deprecated use {@link glyphs} instead
   */
  public getGlyphs() {
    return this.glyphs;
  }

  public getGlyphsAlive(): ArrayList<Glyph> | null {
    if (this.glyphs === null) {
      return null;
    }
    const result = new ArrayList<Glyph>();
    for (const glyph of this.glyphs) {
      if (glyph.isAlive()) {
        result.add(glyph);
      }
    }
    return result;
  }

  public getHeight() {
    return this.cell.getHeight();
  }

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
  getLeaves(
    ...args:
      | [Side]
      | [Side, ArrayList<QuadTree>]
      | [Side, Rectangle2D, ArrayList<QuadTree>]
      | [Rectangle2D]
      | [Rectangle2D, ArrayList<QuadTree>]
      | [Glyph, number]
      | [Glyph, number, ArrayList<QuadTree>]
  ) {
    if (args.length > 0) {
      if (isSide(args[0])) {
        const [side] = args;

        if (isArrayList(args[1])) {
          const [, result] = args;
          return this.__getLeavesSideResult(side, result);
        } else if (isRectangle2D(args[1])) {
          const [, rectangle, result] = args;
          return this.__getLeavesSideRectangleResult(side, rectangle, result!);
        }
        return this.__getLeavesSide(side);
      } else if (isRectangle2D(args[0])) {
        const [rectangle] = args;

        if (isArrayList(args[1])) {
          const [, result] = args;
          return this.__getLeavesRectangleResult(rectangle, result);
        }
        return this.__getLeavesRectangle(rectangle);
      } else if (isGlyph(args[0])) {
        const [glyph] = args;
        if (typeof args[1] === "number") {
          const [, at] = args;
          if (isArrayList(args[2])) {
            const [, , result] = args;
            return this.__getLeavesGlyphAtResult(glyph, at, result);
          }

          return this.__getLeavesGlyphAt(glyph, at);
        }
      }
      throw new Error("unresolved choice");
    } else {
      return this.__getLeaves();
    }
  }

  __getLeaves(): ArrayList<QuadTree> {
    Timers.start("[QuadTree] getLeaves");
    const leaves = new ArrayList<QuadTree>();
    const considering = new ArrayDeque<QuadTree>();
    considering.add(this);
    while (!considering.isEmpty()) {
      const cell = considering.poll();
      if (cell.isLeaf()) {
        leaves.add(cell);
      } else {
        considering.addAll(Arrays.asList(cell.children!));
      }
    }
    Timers.stop("[QuadTree] getLeaves");
    return leaves;
  }

  /**
   * Returns a set of all QuadTree cells that are descendants of this cell,
   * {@link #isLeaf() leaves} and have one side touching the {@code side}
   * border of this cell.
   *
   * @param side Side of cell to find leaves on.
   */
  __getLeavesSide(side: Side): ArrayList<QuadTree> {
    Timers.start("[QuadTree] getLeaves");
    const result = new ArrayList<QuadTree>();
    this.__getLeavesSideResult(side, result);
    Timers.stop("[QuadTree] getLeaves");
    return result;
  }

  /**
   * Returns a set of all QuadTree cells that are descendants of this cell,
   * {@link #isLeaf() leaves} and intersect the given rectangle.
   *
   * @param rectangle The query rectangle.
   */
  __getLeavesRectangle(rectangle: Rectangle2D): ArrayList<QuadTree> {
    Timers.start("[QuadTree] getLeaves(Rectangle2D)");
    const result = new ArrayList<QuadTree>();
    this.__getLeavesRectangleResult(rectangle, result);
    Timers.stop("[QuadTree] getLeaves(Rectangle2D)");
    return result;
  }

  /**
   * Return a set of all leaves of this QuadTree that intersect the given
   * glyph at the given point in time.
   *
   * @param glyph The glyph to consider.
   * @param at    Timestamp/zoom level at which glyph size is determined.
   * @see #insert(Glyph, double)
   */
  __getLeavesGlyphAt(glyph: Glyph, at: number): ArrayList<QuadTree> {
    Timers.start("[QuadTree] getLeaves");
    const result = new ArrayList<QuadTree>();
    this.__getLeavesGlyphAtResult(glyph, at, result);
    Timers.stop("[QuadTree] getLeaves");
    return result;
  }

  /**
   * Return a set of the neighboring cells on the given side of this cell.
   *
   * @param side Side of cell to find neighbors on.
   */
  getNeighbors(side: Side): ArrayList<QuadTree> {
    return this.neighbors.get(side.ordinal());
  }

  /**
   * Returns the first ancestor (parent, grandparent, ...) that is <i>not</i>
   * an {@link #isOrphan() orphan}. In case this node is not an orphan, this
   * will return a self reference.
   */
  getNonOrphanAncestor(): QuadTree {
    let node: QuadTree = this;
    while (node.isOrphan()) {
      node = node.parent!;
    }
    return node;
  }

  getParent() {
    return this.parent;
  }

  getRectangle(): Rectangle2D {
    return this.cell;
  }

  getRoot(): QuadTree {
    if (this.isRoot()) {
      return this;
    }
    return this.parent!.getRoot();
  }

  getSide(side: Side) {
    return new Rectangle2D.Double(
      this.cell.getX() + (side === Side.RIGHT ? this.cell.getWidth() : 0),
      this.cell.getY() + (side === Side.BOTTOM ? this.cell.getHeight() : 0),
      side == Side.TOP || side === Side.BOTTOM ? this.cell.getWidth() : 0,
      side == Side.RIGHT || side === Side.LEFT ? this.cell.getHeight() : 0
    );
  }

  /**
   * Returns the number of cells that make up this QuadTree.
   */
  getSize(): number {
    if (this.isLeaf()) {
      return 1;
    }
    let size = 1;
    for (const child of this.children!) {
      size += child.getSize();
    }
    return size;
  }

  /**
   * Returns the maximum number of links that need to be followed before a
   * leaf cell is reached.
   */
  getTreeHeight(): number {
    if (this.isLeaf()) {
      return 0;
    }
    let height = 1;
    for (const child of this.children!) {
      const childHeight = child.getTreeHeight();
      height = Math.max(height, childHeight + 1);
    }
    return height;
  }

  getWidth() {
    return this.cell.getWidth();
  }

  getX() {
    return this.cell.getX();
  }

  getY() {
    return this.cell.getY();
  }

  /**
   * Insert a given glyph into all cells of this QuadTree it intersects. This
   * method does not care about {@link QuadTree}.
   *
   * @param glyph The glyph to insert.
   * @param at    Timestamp/zoom level at which insertion takes place.
   * @return In how many cells the glyph has been inserted.
   * @see #getLeaves(Glyph, double)
   */
  insert(glyph: Glyph, at: number) {
    Stats.count("QuadTree insert");
    const intersect = GrowFunction.__intersectAtGlyphRectangle(glyph, this.cell);
    // if we intersect at some point, but later than current time
    // (this means that a glyph is in a cell already when its border is in
    //  the cell! see GrowFunction#intersectAt(Glyph, Rectangle2D)
    if (intersect > at + Utils.EPS) {
      Stats.count("QuadTree insert", false);
      return 0;
    }
    // otherwise, we will insert!
    Stats.count("QuadTree insert", true);
    Timers.start("[QuadTree] insert");
    let inserted = 0; // keep track of number of cells we insert into
    if (this.isLeaf()) {
      if (!this.glyphs!.contains(glyph)) {
        this.glyphs!.add(glyph);
        glyph.addCell(this);
        inserted = 1;
      }
    } else {
      for (const child of this.children!) {
        inserted += child.insert(glyph, at);
      }
    }
    Timers.stop("[QuadTree] insert");
    return inserted;
  }

  /**
   * Insert a given glyph into this QuadTree, but treat it as only its center
   * and handle the insertion as a regular QuadTree insertion. This means that
   * a split may be triggered by this insertion, in order to maintain the
   * maximum capacity of cells.
   *
   * @param glyph The glyph center to insert.
   * @return Whether center has been inserted.
   */
  insertCenterOf(glyph: Glyph) {
    Stats.count("QuadTree insertCenterOf");
    if (
      glyph.getX() < this.cell.getMinX() ||
      glyph.getX() > this.cell.getMaxX() ||
      glyph.getY() < this.cell.getMinY() ||
      glyph.getY() > this.cell.getMaxY()
    ) {
      Stats.count("QuadTree insertCenterOf", false);
      return false;
    }
    Stats.count("QuadTree insertCenterOf", true);
    // can we insert here?
    Timers.start("[QuadTree] insert");
    if (this.isLeaf() && this.glyphs!.size() < Constants.MAX_GLYPHS_PER_CELL) {
      if (!this.glyphs!.contains(glyph)) {
        this.glyphs!.add(glyph);
        glyph.addCell(this);
      }
      return true;
    }
    // split if necessary
    if (this.isLeaf()) {
      this.__split();
    }
    // insert into correct child
    this.children![
      Side.quadrant(this.cell, glyph.getX(), glyph.getY())
      ].insertCenterOf(glyph);
    Timers.stop("[QuadTree] insert");
    return true;
  }

  /**
   * Returns whether this cell is an orphan, which it is when its parent has
   * joined and forgot about its children.
   */
  isOrphan() {
    return this._isOrphan;
  }

  /**
   * Returns whether this cell has child cells.
   */
  isLeaf() {
    return this.children == null;
  }

  isRoot() {
    return this.parent == null;
  }

  /**
   * {@inheritDoc}
   * <p>
   * This iterator will iterate over all cells of the QuadTree in a top-down
   * manner: first a node, then its children.
   * @deprecated
   * @use Symbol.iterator
   */
  public iterator(): Iterator<QuadTree> {
    return new Quaderator(this);
  }

  [Symbol.iterator](): Iterator<QuadTree> {
    return new Quaderator(this);
  }

  /**
   * Returns an iterator over all alive glyphs in this QuadTree.
   */
  public iteratorGlyphsAlive(): Iterator<Glyph> {
    return this.__getLeaves()
      .stream()
      .flatMap((cell) => cell.getGlyphsAlive()!.toArray())
      .iterator();
  }

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
  removeGlyph(glyph: Glyph, at: number): boolean {
    Stats.count("QuadTree remove");
    if (this.glyphs != null) {
      Stats.count("QuadTree remove", this.glyphs.remove(glyph));
    } else {
      Stats.count("QuadTree remove", false);
    }
    if (this.parent != null) {
      return this.parent.joinMaybe(at);
    }
    return false;
  }

  /**
   * Performs a regular QuadTree split, treating all glyphs associated with
   * this cell as points, namely their centers. Distributes associated glyphs
   * to the relevant child cells.
   *
   * @see #split(double)
   */
  split(): void;
  /**
   * Split this cell in four and associate glyphs in this cell with the child
   * cells they overlap.
   *
   * @param at Timestamp/zoom level at which split takes place.
   * @see #split()
   */
  split(at: number): void;
  split(at?: number) {
    if (typeof at === "number") {
      return this.__splitAt(at);
    } else if (at === undefined) {
      return this.__split();
    }

    throw new Error("better resolver");
  }

  /**
   * Performs a regular QuadTree split, treating all glyphs associated with
   * this cell as points, namely their centers. Distributes associated glyphs
   * to the relevant child cells.
   *
   * @see #split(double)
   */
  __split() {
    Timers.start("[QuadTree] split");
    this.splitCell();
    // possibly distribute glyphs
    if (!this.glyphs!.isEmpty()) {
      for (const glyph of this.glyphs!) {
        this.children![
          Side.quadrant(this.cell, glyph.getX(), glyph.getY())
          ].insertCenterOf(glyph);
      }
      // only maintain glyphs in leaves
      this.glyphs = null;
    }
    // notify listeners
    Timers.stop("[QuadTree] split");
  }

  /**
   * Split this cell in four and associate glyphs in this cell with the child
   * cells they overlap.
   *
   * @param at Timestamp/zoom level at which split takes place.
   * @see #split()
   */
  __splitAt(at: number) {
    Timers.start("[QuadTree] split");
    this.splitCell();
    // possibly distribute glyphs
    if (!this.glyphs!.isEmpty()) {
      // insert glyph in every child cell it overlaps
      // (a glyph can be inserted into more than one cell!)
      for (const glyph of this.glyphs!) {
        // don't bother with dead glyphs
        if (glyph.isAlive()) {
          this.insert(glyph, at);
        }
      }
      // only maintain glyphs in leaves
      this.glyphs = null;
      // ensure that split did in fact have an effect
      for (const child of this.children!) {
        if (child.glyphs!.size() > Constants.MAX_GLYPHS_PER_CELL) {
          child.__splitAt(at);
        }
      }
    }
    // notify listeners
    Timers.stop("[QuadTree] split");
  }

  toString(): string {
    return `${
      QuadTree.name
    }[cell = [${this.cell.getMinX()} ; ${this.cell.getMaxX()}] x [${this.cell.getMinY()} ; ${this.cell.getMaxY()}]]`;
    // return String.format("%s[cell = [%.2f ; %.2f] x [%.2f ; %.2f]]",
    //     this.getClass().getName(),
    //     cell.getMinX(), cell.getMaxX(), cell.getMinY(), cell.getMaxY());
  }

  /**
   * Actual implementation of {@link #getLeaves(Glyph, double)}.
   */
  private __getLeavesGlyphAtResult(
    glyph: Glyph,
    at: number,
    result: ArrayList<QuadTree>
  ) {
    if (GrowFunction.intersectAt(glyph, this.cell) > at + Utils.EPS) {
      return;
    }
    if (this.isLeaf()) {
      result.add(this);
    } else {
      for (const child of this.children!) {
        child.__getLeavesGlyphAtResult(glyph, at, result);
      }
    }
  }

  /**
   * Add all leaf cells on the given side of the current cell to the given
   * set. If this cell is a leaf, it will add itself as a whole.
   *
   * @param side   Side of cell to take leaves on.
   * @param result Set to add cells to.
   */
  __getLeavesSideResult(side: Side, result: ArrayList<QuadTree>) {
    this.__getLeavesSideRectangleResult(side, null, result);
  }

  /**
   * Add all leaf cells intersecting the given rectangle to the given set. If
   * this cell is a leaf, it will add itself as a whole.
   *
   * @param rectangle Query rectangle.
   * @param result    Set to add cells to.
   */
  __getLeavesRectangleResult(
    rectangle: Rectangle2D,
    result: ArrayList<QuadTree>
  ) {
    if (
      Utils.intervalsOverlap(
        [this.cell.getMinX(), this.cell.getMaxX()],
        [rectangle.getMinX(), rectangle.getMaxX()]
      ) &&
      Utils.intervalsOverlap(
        [this.cell.getMinY(), this.cell.getMaxY()],
        [rectangle.getMinY(), rectangle.getMaxY()]
      )
    ) {
      if (this.isLeaf()) {
        result.add(this);
      } else {
        for (const child of this.children!) {
          child.__getLeavesRectangleResult(rectangle, result);
        }
      }
    }
  }

  /**
   * Add all leaf cells on the given side of the current cell to the given
   * set that intersect the range defined by extending the given rectangle to
   * the given side and its opposite direction infinitely far.
   *
   * @see QuadTree#getLeaves(Side, ArrayList)
   */
  __getLeavesSideRectangleResult(
    side: Side,
    range: Rectangle2D | null,
    result: ArrayList<QuadTree>
  ) {
    if (range != null) {
      // reduce checking overlap to a 1D problem, as the given range and
      // this cell are extended to infinity in one dimension
      const r: [number, number] = [null, null] as any;
      const c: [number, number] = [null, null] as any;
      if (side == Side.TOP || side == Side.BOTTOM) {
        r[0] = range.getMinX();
        r[1] = range.getMaxX();
        c[0] = this.cell.getMinX();
        c[1] = this.cell.getMaxX();
      } else {
        r[0] = range.getMinY();
        r[1] = range.getMaxY();
        c[0] = this.cell.getMinY();
        c[1] = this.cell.getMaxY();
      }
      // in case there is no overlap, return
      if (!Utils.openIntervalsOverlap(r, c)) {
        return;
      }
    }
    if (this.isLeaf()) {
      result.add(this);
      return;
    }
    for (const i of side.quadrants()) {
      this.children![i].__getLeavesSideRectangleResult(side, range, result);
    }
  }

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
  joinMaybe(at: number) {
    Timers.start("[QuadTree] join");
    if (this.isLeaf()) {
      Timers.stop("[QuadTree] join");
      return false;
    }
    let s = 0;
    for (const child of this.children!) {
      if (!child.isLeaf()) {
        Timers.stop("[QuadTree] join");
        return false;
      }
      s += child.getGlyphsAlive()!.size();
    }
    if (s > Constants.MAX_GLYPHS_PER_CELL) {
      Timers.stop("[QuadTree] join");
      return false;
    }

    // do a join, become a leaf, adopt glyphs and neighbors of children
    Stats.count("QuadTree join cells");
    this.glyphs = new ArrayList(Constants.MAX_GLYPHS_PER_CELL);
    for (let quadrant = 0; quadrant < this.children!.length; ++quadrant) {
      const child = this.children![quadrant];
      for (let glyph of child.getGlyphsAlive()!) {
        if (!this.glyphs.contains(glyph)) {
          this.glyphs.add(glyph);
          glyph.addCell(this);
        }
        glyph.removeCell(child);
      }
      child.glyphs = null;
      child._isOrphan = true;
      // adopt neighbors, keep neighbors of orphan intact
      // only adopt neighbors outside of the joined cell
      // also, be careful to not have duplicate neighbors
      for (const side of Side.quadrant(quadrant)) {
        const ns = this.neighbors.get(side.ordinal());
        for (const n of child.neighbors.get(side.ordinal())) {
          if (!ns.contains(n)) {
            ns.add(n);
          }
        }
      }
    }
    // update neighbor pointers of neighbors; point to this instead of
    // any of what previously were our children, but are now orphans
    for (const side of Side.values()) {
      for (const neighbor of this.neighbors.get(side.ordinal())) {
        const neighborNeighbors = neighbor.neighbors.get(
          side.opposite().ordinal()
        );
        for (const child of this.children!) {
          neighborNeighbors.remove(child);
        }
        // the below does not need an "interval overlaps" check; if the
        // child interval overlapped, then our interval will also
        neighborNeighbors.add(this);
      }
    }
    // we become a leaf now, sorry kids
    this.children = null;
    Timers.stop("[QuadTree] join");

    // recursively check if parent could join now
    if (this.parent != null) {
      this.parent.joinMaybe(at);
    }

    // since we joined, return `true` independent of whether parent joined
    return true;
  }

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
  private splitCell() {
    // already split?
    if (!this.isLeaf()) {
      throw new Error("cannot split cell that is already split");
    }

    // do the split
    Stats.count("QuadTree split cell");
    this.children = [null, null, null, null] as any;
    const x = this.getX();
    const y = this.getY();
    const w = this.getWidth();
    const h = this.getHeight();
    if (w / 2 < Constants.MIN_CELL_SIZE || h / 2 < Constants.MIN_CELL_SIZE) {
      throw new Error("cannot split a tiny cell");
    }
    for (let i = 0; i < 4; ++i) {
      this.children![i] = new QuadTree(
        x + (i % 2 == 0 ? 0 : w / 2),
        y + (i < 2 ? 0 : h / 2),
        w / 2,
        h / 2
      );
      this.children![i].parent = this;
    }

    // update neighbors of neighbors; we split now
    for (const side of Side.values()) {
      for (const neighbor of this.neighbors.get(side.ordinal())) {
        const neighborsOnOurSide = neighbor.neighbors.get(
          side.opposite().ordinal()
        );
        neighborsOnOurSide.remove(this);
        for (const quadrant of side.quadrants()) {
          // only add as neighbors when they actualy neighbor our
          // newly created children
          if (
            Utils.openIntervalsOverlap(
              Side.interval(this.children![quadrant].cell, side),
              Side.interval(neighbor.cell, side)
            )
          ) {
            neighborsOnOurSide.add(this.children![quadrant]);
          }
        }
      }
    }

    // update neighbors
    for (const side of Side.values()) {
      const neighborsOnSide = this.neighbors.get(side.ordinal());
      for (const quadrant of side.quadrants()) {
        const qi = Side.interval(this.children![quadrant].cell, side);
        // distribute own neighbors over children
        // ensure that the neighbor is "in range" of the child
        // cell; technically, we would need to consider the
        // side.opposite() of the neighbor, but since it reduces
        // to a 1D comparison with the exact same interval, we
        // save ourselves some calculation and do it like this
        const list = new ArrayList<QuadTree>();
        for (const neighbor of neighborsOnSide) {
          if (Utils.openIntervalsOverlap(qi,
            Side.interval(neighbor.cell, side))) {
            list.add(neighbor);
          }
        }
        this.children[quadrant].neighbors.get(side.ordinal()).addAll(list.toArray());
        // the children are neighbors of each other; record this
        this.children![quadrant].neighbors
          .get(side.opposite().ordinal())
          .add(this.children![Side.quadrantNeighbor(quadrant, side.opposite())]);
      }
      neighborsOnSide.clear();
    }
  }
}

/**
 * Iterator for QuadTrees.
 */
class Quaderator implements Iterator<QuadTree> {
  private toVisit: LinkedList<QuadTree>;

  constructor(quadTree: QuadTree) {
    this.toVisit = new LinkedList();
    this.toVisit.add(quadTree);
  }

  public isDone() {
    return this.toVisit.isEmpty();
  }

  public next(): IteratorResult<QuadTree> {
    const value = this.toVisit.poll();
    if (!value.isLeaf()) {
      this.toVisit.addAll(value.children!);
      // Collections.addAll(this.toVisit, value.children);
    }
    return {value, done: this.isDone()};
  }
}
