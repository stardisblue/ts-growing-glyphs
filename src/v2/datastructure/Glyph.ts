import { ArrayList } from '../java/ArrayList';
import { Constants } from '../utils/Constants';
import { QuadTree } from './QuadTree';
import { UncertainQueue } from './queues/UncertainQueue';
import { PriorityQueue } from '../java/PriorityQueue';
import { GlyphMerge } from './events/GlyphMerge';
import { OutOfCell } from './events/OutOfCell';
import { Stats, Utils } from '../utils/Utils';
import { UncertainGlyphMerge } from './events/UncertainGlyphMerge';
import { Level, Logger } from '../java/Logger';
import { MultiQueue } from './queues/MultiQueue';
import { Stat } from '../utils/Stat';

function isNNN(args: any[]): args is [number, number, number] {
  return (
    args.length > 0 &&
    typeof args[0] === 'number' &&
    typeof args[1] === 'number' &&
    typeof args[2] === 'number'
  );
}

function isNNNB(args: any[]): args is [number, number, number, boolean] {
  return (
    args.length > 0 &&
    typeof args[0] === 'number' &&
    typeof args[1] === 'number' &&
    typeof args[2] === 'number' &&
    typeof args[3] === 'number'
  );
}

function isIterable<R>(item: any): item is Iterable<R> {
  return item[Symbol.iterator] !== undefined && item[Symbol.iterator] !== null;
}

function isGA(args: any[]): args is Glyph[] {
  return isIterable(args) && args[0] instanceof Glyph;
}

export function isGlyph(item: any): item is Glyph {
  return item === null || item instanceof Glyph;
}

export class Glyph {
  /**
   * Whether this glyph is of special interest. Used for debugging.
   */
  public track: boolean;
  /**
   * Used by the clustering algorithm to track which glyphs think they'll merge
   * with {@code this} glyph before merging with any other glyph.
   */
  public trackedBy: ArrayList<Glyph>;

  /**
   * X-coordinate of the center of the glyph.
   */
  private x: number;
  /**
   * Y-coordinate of the center of the glyph.
   */
  private y: number;
  /**
   * Number of entities represented by the glyph.
   */
  private n: number;
  /**
   * Used by clustering algorithm to track which glyphs are still of interest.
   * Not set: 0, alive: 1, perished: 2.
   */
  private alive: number;
  /**
   * Whether this glyph represents {@linkplain Constants#BIG_GLYPH_FACTOR
   * more entities than the average glyph} at the time it is constructed.
   */
  private big: boolean;
  /**
   * Set of QuadTree cells that this glyph intersects.
   */
  private cells: ArrayList<QuadTree>;
  /**
   * Uncertain events involving this glyph: only initialized and used in case
   * this is a big glyph. See ... for details.
   */
  private uncertainMergeEvents: UncertainQueue;
  /**
   * The uncertain merge events can be adopted by another big glyph. This in
   * fact means that the glyph has merged and grown. This pointer will point
   * to that glyph, so that the "bigger version" of this glyph can be found.
   */
  private adoptedBy: Glyph;
  /**
   * Events involving this glyph. Only one event is actually in the event
   * queue, others are added only when that one is popped from the queue.
   */
  private mergeEvents: PriorityQueue<GlyphMerge>;
  /**
   * Events involving this glyph. Only one event is actually in the event
   * queue, others are added only when that one is popped from the queue.
   */
  private outOfCellEvents: PriorityQueue<OutOfCell>;

  /**
   * Construct a new glyph at the given coordinates, with given growing speed.
   * The constructed glyph is not alive.
   *
   * @param x X-coordinate of the center of the glyph.
   * @param y Y-coordinate of the center of the glyph.
   * @param n Number of entities represented by the glyph.
   * @throws IllegalArgumentException When n < 1.
   */
  constructor(x: number, y: number, n: number);
  /**
   * Construct a new glyph at the given coordinates, with given weight.
   *
   * @param x     X-coordinate of the center of the glyph.
   * @param y     Y-coordinate of the center of the glyph.
   * @param n     Number of entities represented by the glyph.
   * @param alive Whether the glyph is marked alive or not.
   * @throws IllegalArgumentException When n < 1.
   */
  constructor(x: number, y: number, n: number, alive: boolean);
  /**
   * Construct a new glyph that has its center at the weighted average of the
   * centers of the given glyphs, and the sum of their weights.
   *
   * @param glyphs glyphs to construct a new glyph out of.
   */
  constructor(glyphs: Iterable<Glyph>);
  /**
   * @see #Glyph(Iterable)
   */
  constructor(...glyphs: Glyph[]);
  constructor(...args: any[]) {
    if (isNNN(args) || isNNNB(args)) {
      const [x, y, n, alive = false] = args;
      this.__constructor(x, y, n, alive);
    } else if (args[0] && isIterable<Glyph>(args[0])) {
      const [glyphs] = args;
      this.__constructorGlyphs(glyphs);
    } else if (isGA(args)) {
      this.__constructorGlyphsArray(...args);
    } else {
      throw new Error('failed to resolve arguments');
    }
  }

  __constructor(x: number, y: number, n: number, alive: boolean = false) {
    if (n < 1) {
      throw new Error('n must be at least 1');
    }
    this.track = false;
    if (Constants.TRACK && !Constants.ROBUST) {
      this.trackedBy = new ArrayList();
    } else {
      this.trackedBy = null;
    }
    this.x = x;
    this.y = y;
    this.n = n;
    this.alive = alive ? 1 : 0;
    this.big = false;
    this.cells = new ArrayList();
    this.uncertainMergeEvents = null;
    this.adoptedBy = null;
    this.mergeEvents = new PriorityQueue(Constants.MAX_MERGES_TO_RECORD);
    this.outOfCellEvents = new PriorityQueue();
  }

  /**
   * Construct a new glyph that has its center at the weighted average of the
   * centers of the given glyphs, and the sum of their weights.
   *
   * @param glyphs glyphs to construct a new glyph out of.
   */
  __constructorGlyphs(glyphs: Iterable<Glyph>) {
    this.__constructor(0, 0, 1);
    this.n = 0; // fati wtf ?
    for (const glyph of glyphs) {
      this.x += glyph.x * glyph.n;
      this.y += glyph.y * glyph.n;
      this.n += glyph.n;
      this.track = this.track || glyph.track;
    }
    this.x /= this.n;
    this.y /= this.n;
  }

  /**
   * @see #Glyph(Iterable)
   */
  __constructorGlyphsArray(...glyphs: Glyph[]) {
    this.__constructorGlyphs(glyphs);
  }

  /**
   * Record another cell intersecting the glyph.
   *
   * @param cell Cell to be added.
   */
  addCell(cell: QuadTree) {
    if (!this.cells.contains(cell)) {
      this.cells.add(cell);
    }
  }

  /**
   * Given some {@linkplain #isBig() big} glyph, adopt the uncertain merge
   * events of that glyph onto this one. This will clear the queue of uncertain
   * merge events on {@code bigGlyph}.
   *
   * @param bigGlyph Glyph of which to adopt the uncertain merge events.
   * @param event    The merge event that caused the need for adoption.
   */
  adoptUncertainMergeEvents(bigGlyph: Glyph, event: GlyphMerge) {
    if (!this.isBig() || !bigGlyph.isBig()) {
      throw new Error('both this glyph and bigGlyph must be big');
    }
    if (this.uncertainMergeEvents.size() > 0) {
      throw new Error('can only adopt when it has no events yet');
    }

    const old = this.uncertainMergeEvents;
    this.uncertainMergeEvents = bigGlyph.uncertainMergeEvents;
    this.uncertainMergeEvents.updateAlpha(event);
    bigGlyph.uncertainMergeEvents = old;
    bigGlyph.adoptedBy = this;
  }

  /**
   * Returns this glyph, or if it is big and its uncertain merge events have
   * that adopted them, or the glyph that adopted them from that glyph, et
   * cetera, until a glyph is found that did not have its events adopted yet.
   */
  getAdoptivePrimalParent(): Glyph {
    if (this.adoptedBy === null) {
      return this;
    }
    return this.adoptedBy.getAdoptivePrimalParent();
  }

  /**
   * Returns all recorded cells intersecting the glyph.
   * @deprecated use #cells in js
   */
  getCells() {
    return this.cells;
  }

  /**
   * Returns the number of entities represented by the glyph.
   * @deprecated use #n in js
   */
  getN() {
    return this.n;
  }

  /**
   * Returns the X-coordinate of the center of the glyph.
   * @deprecated use #x in js
   */
  getX() {
    return this.x;
  }

  /**
   * Returns the Y-coordinate of the center of the glyph.
   * @deprecated use #y in js
   */
  public getY() {
    return this.y;
  }

  /**
   * Hash only the location of the glyph, for performance reasons.
   */
  hashCode() {
    return `${this.x}:${this.y}`;
  }

  /**
   * Returns whether this glyph and the given one share both X- and Y-
   * coordinates. This is checked using
   * {@link Utils.Double#eq(double, double)}, so with an epsilon.
   *
   * @param that Glyph to consider.
   */
  hasSamePositionAs(that: Glyph): boolean {
    return Utils.Double.eq(this.x, that.x) && Utils.Double.eq(this.y, that.y);
  }

  /**
   * Returns whether this glyph is still taking part in the clustering process.
   */
  public isAlive(): boolean {
    return this.alive === 1;
  }

  /**
   * Returns whether this glyph is considered to be a big glyph, meaning that
   * at the time of its construction, it was representing more than {@link
   * Constants#BIG_GLYPH_FACTOR} times the average number of entities.
   *
   * <p>Glyphs initially are not big, but can be determined to be big when they
   * {@link QuadTreeClusterer}.
   * @deprecated use #big in js
   */
  public isBig() {
    return this.big;
  }

  /**
   * Implement strict equality.
   */
  equals(obj: any): obj is this {
    return this === obj;
  }

  /**
   * Marks this glyph as alive: participating in the clustering process.
   */
  participate() {
    if (this.alive == 1) {
      throw new Error('having a participating glyph participate');
    }
    if (this.alive == 2) {
      throw new Error('cannot bring a perished glyph back to life');
    }
    this.alive = 1;
  }

  /**
   * Returns the first merge event that will occur with this big glyph, or
   * {@code null} if there is none remaining.
   */
  peekUncertain(): UncertainGlyphMerge {
    return this.uncertainMergeEvents.peek();
  }

  /**
   * Marks this glyph as not alive: no longer participating in the clustering
   * process.
   */
  perish() {
    this.alive = 2;
  }

  /**
   * Same as {@link #peekUncertain()}, but actually removes that event from
   * the internal queue it is stored in.
   */
  pollUncertain(): UncertainGlyphMerge {
    return this.uncertainMergeEvents.poll();
  }

  /**
   * Add the next event, if any, to the given queue. This will add the first
   * {@link #record(GlyphMerge) recorded} event to the given queue.
   *
   * @param q Event queue to add {@link GlyphMerge} to.
   * @param l Logger to log events to. Can be {@code null}.
   * @return Whether an event was popped into the queue.
   */
  popMergeInto(q: MultiQueue, l: Logger | null): boolean {
    if (this.big) {
      throw new Error(
        "big glyphs don't pop merge events into the shared queue"
      );
    }

    // try to pop a merge event into the queue as long as the previously
    // recorded merge is with a glyph that is still alive... give up as
    // soon as no recorded events remain
    while (!this.mergeEvents.isEmpty()) {
      const merge = this.mergeEvents.poll();
      const wth = merge.getOther(this);
      if (!wth.isAlive() || wth.isBig()) {
        continue; // try the next event
      }
      q.add(merge);
      if (Constants.TRACK && !Constants.ROBUST) {
        if (!wth.trackedBy.contains(this)) {
          wth.trackedBy.add(this);
        }
      }
      if (l != null) {
        l.log(Level.FINEST, `→ merge at ${merge.getAt()} with ${wth}`);
      }
      // we found an event and added it to the queue, return
      return true;
    }
    // no recorded events remain, we cannot add an event
    return false;
  }

  /**
   * Add the next event, if any, to the given queue. This will add the first
   * {@link #record(OutOfCell) recorded} event to the given queue.
   *
   * @param q Event queue to add {@link OutOfCell} to.
   * @param l Logger to log events to, can be {@code null}.
   * @return Whether an event was popped into the queue.
   */
  popOutOfCellInto(q: MultiQueue, l: Logger | null): boolean {
    if (this.big) {
      throw new Error(
        "big glyphs don't pop out of cell events into the shared queue"
      );
    }

    let added = false;
    while (!this.outOfCellEvents.isEmpty()) {
      const o = this.outOfCellEvents.poll();
      if (l !== null) {
        l.log(Level.FINEST, `popping ${o} into the queue`);
      }
      q.add(o);
      added = true;
      if (!Constants.ROBUST) {
        return true;
      }
    }
    if (Constants.ROBUST && added) {
      return true;
    }
    if (l != null) {
      l.log(Level.FINEST, 'no out of cell event to pop');
    }
    return false;
  }

  /**
   * Acknowledge that the given event will happen.
   *
   * @param event Event involving this glyph.
   */
  record(event: GlyphMerge);
  /**
   * Acknowledge that the given event will happen.
   *
   * @param event Event involving this glyph.
   */
  record(event: UncertainGlyphMerge);
  /**
   * Acknowledge that the given event will happen.
   *
   * @param event Event involving this glyph.
   */
  record(event: OutOfCell);
  record(event: GlyphMerge | UncertainGlyphMerge | OutOfCell) {
    if (event instanceof GlyphMerge) {
      return this.__recordG(event);
    } else if (event instanceof UncertainGlyphMerge) {
      return this.__recordU(event);
    } else if (event instanceof OutOfCell) {
      return this.__recordO(event);
    }

    throw new Error('unresolved choice');
  }

  /**
   * Acknowledge that the given event will happen.
   *
   * @param event Event involving this glyph.
   */
  __recordG(event: GlyphMerge) {
    this.mergeEvents.add(event);
  }

  /**
   * Acknowledge that the given event will happen.
   *
   * @param event Event involving this glyph.
   */
  __recordU(event: UncertainGlyphMerge) {
    this.uncertainMergeEvents.add(event);
  }

  /**
   * Acknowledge that the given event will happen.
   *
   * @param event Event involving this glyph.
   */
  __recordO(event: OutOfCell) {
    this.outOfCellEvents.add(event);
  }

  /**
   * Record a cell no longer intersecting the glyph.
   *
   * @param cell Cell to be removed.
   */
  removeCell(cell: QuadTree) {
    this.cells.remove(cell);
  }

  /**
   * Update whether this glyph is big using the given statistic.
   *
   * @param glyphSize Statistic covering number of entities represented by
   *                  other glyphs, used to determine if this glyph {@link #isBig()}.
   */
  setBig(glyphSize: Stat) {
    if (!Constants.BIG_GLYPHS) {
      return;
    }

    this.big = this.n > glyphSize.getAverage() * Constants.BIG_GLYPH_FACTOR;
    Stats.count('glyph was big when it participated', this.big);

    // if the glyph is big, initialize uncertain merge event tracking
    if (this.big) {
      this.uncertainMergeEvents = new UncertainQueue();
    }
  }

  /**
   * Change number of entities represented by this glyph. Should not normally
   *
   * @param n New number of entities.
   * @deprecated use #n in js
   */
  setN(n: number) {
    this.n = n;
  }

  toString() {
    // String.format("glyph [x = %.2f, y = %.2f, n = %d]", x, y, n)
    return `glyph [x = ${this.x.toFixed(2)}, y = ${this.y.toFixed(2)}, n = ${
      this.n
    }]`;
  }

  static __isAlive(g: Glyph) {
    return g.isAlive();
  }
}
