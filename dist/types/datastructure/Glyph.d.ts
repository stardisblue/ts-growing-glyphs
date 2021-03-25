import { ArrayList } from '../java/ArrayList';
import { QuadTree } from './QuadTree';
import { GlyphMerge } from './events/GlyphMerge';
import { OutOfCell } from './events/OutOfCell';
import { UncertainGlyphMerge } from './events/UncertainGlyphMerge';
import { Logger } from '../java/Logger';
import { MultiQueue } from './queues/MultiQueue';
import { Stat } from '../utils/Stat';
export declare function isGlyph(item: any): item is Glyph;
export declare class Glyph {
    /**
     * Whether this glyph is of special interest. Used for debugging.
     */
    track: boolean;
    /**
     * Used by the clustering algorithm to track which glyphs think they'll merge
     * with {@code this} glyph before merging with any other glyph.
     */
    trackedBy: ArrayList<Glyph>;
    /**
     * X-coordinate of the center of the glyph.
     */
    private x;
    /**
     * Y-coordinate of the center of the glyph.
     */
    private y;
    /**
     * Number of entities represented by the glyph.
     */
    private n;
    /**
     * Used by clustering algorithm to track which glyphs are still of interest.
     * Not set: 0, alive: 1, perished: 2.
     */
    private alive;
    /**
     * Whether this glyph represents {@linkplain Constants#BIG_GLYPH_FACTOR
     * more entities than the average glyph} at the time it is constructed.
     */
    private big;
    /**
     * Set of QuadTree cells that this glyph intersects.
     */
    private cells;
    /**
     * Uncertain events involving this glyph: only initialized and used in case
     * this is a big glyph. See ... for details.
     */
    private uncertainMergeEvents;
    /**
     * The uncertain merge events can be adopted by another big glyph. This in
     * fact means that the glyph has merged and grown. This pointer will point
     * to that glyph, so that the "bigger version" of this glyph can be found.
     */
    private adoptedBy;
    /**
     * Events involving this glyph. Only one event is actually in the event
     * queue, others are added only when that one is popped from the queue.
     */
    private mergeEvents;
    /**
     * Events involving this glyph. Only one event is actually in the event
     * queue, others are added only when that one is popped from the queue.
     */
    private outOfCellEvents;
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
    __constructor(x: number, y: number, n: number, alive?: boolean): void;
    /**
     * Construct a new glyph that has its center at the weighted average of the
     * centers of the given glyphs, and the sum of their weights.
     *
     * @param glyphs glyphs to construct a new glyph out of.
     */
    __constructorGlyphs(glyphs: Iterable<Glyph>): void;
    /**
     * @see #Glyph(Iterable)
     */
    __constructorGlyphsArray(...glyphs: Glyph[]): void;
    /**
     * Record another cell intersecting the glyph.
     *
     * @param cell Cell to be added.
     */
    addCell(cell: QuadTree): void;
    /**
     * Given some {@linkplain #isBig() big} glyph, adopt the uncertain merge
     * events of that glyph onto this one. This will clear the queue of uncertain
     * merge events on {@code bigGlyph}.
     *
     * @param bigGlyph Glyph of which to adopt the uncertain merge events.
     * @param event    The merge event that caused the need for adoption.
     */
    adoptUncertainMergeEvents(bigGlyph: Glyph, event: GlyphMerge): void;
    /**
     * Returns this glyph, or if it is big and its uncertain merge events have
     * that adopted them, or the glyph that adopted them from that glyph, et
     * cetera, until a glyph is found that did not have its events adopted yet.
     */
    getAdoptivePrimalParent(): Glyph;
    /**
     * Returns all recorded cells intersecting the glyph.
     * @deprecated use #cells in js
     */
    getCells(): ArrayList<QuadTree>;
    /**
     * Returns the number of entities represented by the glyph.
     * @deprecated use #n in js
     */
    getN(): number;
    /**
     * Returns the X-coordinate of the center of the glyph.
     * @deprecated use #x in js
     */
    getX(): number;
    /**
     * Returns the Y-coordinate of the center of the glyph.
     * @deprecated use #y in js
     */
    getY(): number;
    /**
     * Hash only the location of the glyph, for performance reasons.
     */
    hashCode(): string;
    /**
     * Returns whether this glyph and the given one share both X- and Y-
     * coordinates. This is checked using
     * {@link Utils.Double#eq(double, double)}, so with an epsilon.
     *
     * @param that Glyph to consider.
     */
    hasSamePositionAs(that: Glyph): boolean;
    /**
     * Returns whether this glyph is still taking part in the clustering process.
     */
    isAlive(): boolean;
    /**
     * Returns whether this glyph is considered to be a big glyph, meaning that
     * at the time of its construction, it was representing more than {@link
     * Constants#BIG_GLYPH_FACTOR} times the average number of entities.
     *
     * <p>Glyphs initially are not big, but can be determined to be big when they
     * {@link QuadTreeClusterer}.
     * @deprecated use #big in js
     */
    isBig(): boolean;
    /**
     * Implement strict equality.
     */
    equals(obj: any): obj is this;
    /**
     * Marks this glyph as alive: participating in the clustering process.
     */
    participate(): void;
    /**
     * Returns the first merge event that will occur with this big glyph, or
     * {@code null} if there is none remaining.
     */
    peekUncertain(): UncertainGlyphMerge;
    /**
     * Marks this glyph as not alive: no longer participating in the clustering
     * process.
     */
    perish(): void;
    /**
     * Same as {@link #peekUncertain()}, but actually removes that event from
     * the internal queue it is stored in.
     */
    pollUncertain(): UncertainGlyphMerge;
    /**
     * Add the next event, if any, to the given queue. This will add the first
     * {@link #record(GlyphMerge) recorded} event to the given queue.
     *
     * @param q Event queue to add {@link GlyphMerge} to.
     * @param l Logger to log events to. Can be {@code null}.
     * @return Whether an event was popped into the queue.
     */
    popMergeInto(q: MultiQueue, l: Logger | null): boolean;
    /**
     * Add the next event, if any, to the given queue. This will add the first
     * {@link #record(OutOfCell) recorded} event to the given queue.
     *
     * @param q Event queue to add {@link OutOfCell} to.
     * @param l Logger to log events to, can be {@code null}.
     * @return Whether an event was popped into the queue.
     */
    popOutOfCellInto(q: MultiQueue, l: Logger | null): boolean;
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */
    record(event: GlyphMerge): any;
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */
    record(event: UncertainGlyphMerge): any;
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */
    record(event: OutOfCell): any;
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */
    __recordG(event: GlyphMerge): void;
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */
    __recordU(event: UncertainGlyphMerge): void;
    /**
     * Acknowledge that the given event will happen.
     *
     * @param event Event involving this glyph.
     */
    __recordO(event: OutOfCell): void;
    /**
     * Record a cell no longer intersecting the glyph.
     *
     * @param cell Cell to be removed.
     */
    removeCell(cell: QuadTree): void;
    /**
     * Update whether this glyph is big using the given statistic.
     *
     * @param glyphSize Statistic covering number of entities represented by
     *                  other glyphs, used to determine if this glyph {@link #isBig()}.
     */
    setBig(glyphSize: Stat): void;
    /**
     * Change number of entities represented by this glyph. Should not normally
     *
     * @param n New number of entities.
     * @deprecated use #n in js
     */
    setN(n: number): void;
    toString(): string;
    static __isAlive(g: Glyph): boolean;
}
//# sourceMappingURL=Glyph.d.ts.map