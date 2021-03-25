/**
 * This class can be used to record the first merge(s) that will occur with a
 * glyph. More than one merge may be recorded, and glyphs can be
 * {@link Glyph#record(GlyphMerge) made aware} of the merges that are happening
 * to them. This class respects {@link Glyph}.
 */
import { Logger } from "../java/Logger";
import { Glyph } from "../datastructure/Glyph";
import { MultiQueue } from "../datastructure/queues/MultiQueue";
import { GlyphMerge } from "../datastructure/events/GlyphMerge";
import { ArrayList, Stream } from "../java/ArrayList";
import { QuadTree } from "../datastructure/QuadTree";
export declare class FirstMerge {
    /**
     * First times at which merge events with {@link FirstMergeRecorder#from}
     * are recorded so far. This will contain the timestamp of the first
     * event, then the timestamp of the second, et cetera.
     */
    private at;
    /**
     * Set of glyphs that touch {@link FirstMergeRecorder#from} at time
     * {@link #at}. In practice this will almost always contain just a
     * single glyph. Similarly to {@link #at}, this is a list that tracks
     * the set for the first, second, ... merge events.
     */
    private glyphs;
    /**
     * Number of merges that have been recorded.
     */
    private size;
    constructor();
    accept(parent: FirstMergeRecorder, candidate: Glyph): void;
    combine(that: FirstMerge): this;
    getGlyphs(): ArrayList<Glyph>;
    reset(): void;
    resizeIfNeeded(): void;
    pop(from: Glyph): GlyphMerge[] | null;
}
export declare class FirstMergeRecorder {
    /**
     * Return a reference to the singleton instance of this class, creating an
     * instance when not done before. The instance will use the given
     * {@link GrowFunction}, and when an instance was created before then the
     * grow function being used by that instance is changed before a reference
     * to it is returned. <b>Note</b> that that will change the grow function
     * being used for all users of the singleton instance!
     * <p>
     * The reason that this class has a singleton instance is that it internally
     * uses the Stream API with instances of a private inner class. Other
     * instances of {@link FirstMergeRecorder} may, via the Stream API, use
     * instances of the private inner class that have a different parent. This
     * goes, as one might expect, horribly wrong. Using a singleton instance is
     * a quick and easy way around this problem.
     *
     * @return A reference to the singleton instance of this class.
     */
    static getInstance(): FirstMergeRecorder;
    /**
     * Collector for stream operations.
     */
    private static collector;
    /**
     * Singleton instance.
     */
    private static INSTANCE;
    private static readonly REUSABLE_RECORDS;
    static readonly COMBINE_RESULT: FirstMerge;
    private static firstReusedRecord;
    /**
     * Returns an instance of {@link FirstMerge} that is {@link FirstMerge#reset()}
     * and ready to accept and combine. This method may cache instances and reuse
     * them. {@link #REUSABLE_RECORDS} is used to this end.
     */
    private static newInstance;
    /**
     * Glyph with which merges are recorded.
     */
    _from: Glyph | null;
    /**
     * Container that records when the first merge(s) occur(s), and which glyph(s)
     * will merge with {@link #_from} at that point in time.
     */
    private readonly merge;
    private constructor();
    /**
     * @see #addEventsTo(MultiQueue, Logger)
     */
    addEventsTo(q: MultiQueue): void;
    /**
     * Given the glyph {@link #_from} which recording started, and all possible
     * merges that have been {@link #record(Glyph[], int, int) recorded} after that, one or
     * more merge events will occur first; those are added to the given queue by
     * this method. State is maintained, although it is recommended that this is
     * not used, only {@link #_from} could be used to reset state and start over.
     *
     * @param q MultiQueue to add merge events to.
     * @param l Logger to log events to, can be {@code null}.
     */
    addEventsTo(q: MultiQueue, l: Logger | null): void;
    collector(): (glyphs: Glyph[]) => FirstMerge;
    /**
     * Start recording possible merges with the given glyph, forgetting about
     * all previous state.
     *
     * @param from Glyph with which merges should be recorded starting now.
     */
    from(from: Glyph): void;
    /**
     * {@link #record Record} all glyphs in the given stream, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Stream of glyphs to record.
     * @deprecated
     */
    record(glyphs: Stream<Glyph>): void;
    /**
     * {@link #record Record} all glyphs in the given set, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Set of glyphs to record.
     * @deprecated
     */
    record(glyphs: ArrayList<Glyph>): void;
    /**
     * {@link #record Record} all glyphs in the given array between the
     * given indices (including {@code from}, excluding {@code upto}). Only when
     * they are  and not {@link #from}, they are recorded.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Array of glyphs to look in.
     * @param from   First index of glyph to record.
     * @param upto   Index up to but excluding which glyphs will be recorded.
     * @deprecated
     */
    record(glyphs: Glyph[], from: number, upto: number): void;
    /**
     * {@link #record Record} all glyphs in the given array between the
     * given indices (including {@code from}, excluding {@code upto}). Only when
     * they are  and not {@link #from}, they are recorded.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Array of glyphs to look in.
     * @param from   First index of glyph to record.
     * @param upto   Index up to but excluding which glyphs will be recorded.
     */
    __recordGlyphNumberNumber(glyphs: Glyph[], from: number, upto: number): void;
    /**
     * {@link #record Record} all glyphs in the given set, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Set of glyphs to record.
     */
    __recordArrayList(glyphs: ArrayList<Glyph>): void;
    /**
     * {@link #record Record} all glyphs in the given stream, as long as
     * they are  and not {@link #from}.
     * <p>
     * This method may use parallelization to speed up recording.
     *
     * @param glyphs Stream of glyphs to record.
     */
    __recordStream(glyphs: Stream<Glyph>): void;
    recordAllPairs(cell: QuadTree, q: MultiQueue): void;
}
//# sourceMappingURL=FirstMergeRecorder.d.ts.map