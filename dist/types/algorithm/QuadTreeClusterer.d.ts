import { QuadTree } from "../datastructure/QuadTree";
import { Glyph } from "../datastructure/Glyph";
import { HierarchicalClustering } from "../datastructure/HierarchicalClustering";
import { MultiQueue } from "../datastructure/queues/MultiQueue";
export declare class QuadTreeClusterer {
    /**
     * Tree with {@link Glyph glyphs} that need clustering.
     */
    protected tree: QuadTree;
    /**
     * Resulting clustering.
     */
    protected result: HierarchicalClustering | null;
    /**
     * Single object that is used to easily find merge events to be added.
     */
    private rec;
    constructor(tree: QuadTree);
    cluster(): QuadTreeClusterer;
    getName(): string;
    /**
     * Find glyphs that overlap the given glyph at the given timestamp/zoom level,
     * and create merge events for those instances. Add those merge events to the
     * given priority queue.
     * <p>
     * The merge events created by this function are with {@code null} instead of
     * with {@code with}, for convenience reasons in the nested merge loop. That
     * is, the `merged` glyph changes (the object), even though the conceptual
     * glyph does not. Representing with {@code null} fixes that problem.
     *
     * @param wth      Glyph to check overlap with.
     * @param at        Timestamp/zoom level at which overlap must be checked.
     * @param addTo     Queue to add merge events to.
     * @param bigGlyphs List of big glyphs currently alive.
     * @return Whether any overlap was found at all.
     */
    private findOverlap;
    /**
     * Returns the first event that will happen. Normally, this is the head of
     * the given {@link MultiQueue} (modulo discarded events). However, the queues
     * of {@linkplain GlobalState#bigGlyphs big glyphs} are also checked.
     *
     * @return The next event to occur, or {@code null} if there are no more
     * events to handle or only a single alive glyph left.
     */
    private static getNextEvent;
    private handleBigGlyphMerge;
    private handleGlyphMerge;
    private handleOutOfCell;
    /**
     * Given a big glyph, create uncertain merge events with all other glyphs in
     * the QuadTree, and other big glyphs if there are any.
     */
    private initializeBigGlyphEvents;
    /**
     * Given a merge event, see if performing it would cause more merges, and
     * process those repeatedly until no overlap remains. This function also
     * has glyphs that tracked any merged glyphs update who they track, and
     * inserts the merged glyph into the QuadTree. When the merging of glyphs
     * causes cells of the QuadTree to join, then new merge events are created
     * in those joined cells as well.
     */
    private processNestedMerges;
    private recordGlyphAndStats;
    /**
     * Given a freshly created glyph originating from a merge, loop over the
     * QuadTree cells of that glyph and record out of cell events for all.
     * In the same loop, find merges as well, using the global {@link #rec}.
     */
    recordEventsForGlyph(merged: Glyph, at: number, q: MultiQueue): void;
    /**
     * Executed right before going to the next iteration of the event handling
     * loop. Possibly pauses executiong, depending on parameter.
     */
    private step;
    /**
     * Returns the latest result of executing the clustering algorithm. Initially
     * {@code null}.
     */
    getClustering(): HierarchicalClustering;
    /**
     * Forget about any clustering obtained so far.
     */
    reset(): void;
}
//# sourceMappingURL=QuadTreeClusterer.d.ts.map