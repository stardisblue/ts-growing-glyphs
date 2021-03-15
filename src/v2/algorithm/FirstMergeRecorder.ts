/**
 * This class can be used to record the first merge(s) that will occur with a
 * glyph. More than one merge may be recorded, and glyphs can be
 * {@link Glyph#record(GlyphMerge) made aware} of the merges that are happening
 * to them. This class respects {@link Glyph}.
 */
import {Level, Logger} from "../java/Logger";
import {Constants} from "../utils/Constants";
import {Glyph} from "../datastructure/Glyph";
import {ArrayDeque} from "../java/ArrayDeque";
import {MultiQueue} from "../datastructure/queues/MultiQueue";
import {GlyphMerge} from "../datastructure/events/GlyphMerge";
import {Arrays} from "../java/Arrays";
import {ArrayList, Stream} from "../java/ArrayList";
import {Collectors} from "../java/Collectors";
import {Timers, Utils} from "../utils/Utils";
import {QuadTree} from "../datastructure/QuadTree";
import {GrowFunction} from "../datastructure/growfunction/GrowFunction";

function getLogger() {
  let l: Logger|null;

  return Constants.LOGGING_ENABLED &&
  (l = Logger.getLogger("FirstMergeRecorder"))?.isLoggable(Level.FINER)
    ? l
    : null;
}

/**
 * The logger of this class, that is instantiated only when logging is
 * enabled and {@link Level#FINE} messages are loggable. This is done because
 * there are some heavy-to-construct logging parameters, which are guarded by
 * cheap {@code LOGGER != null} checks. This is more efficient than checking
 * repeatedly whether the message is loggable.
 */
const LOGGER = getLogger();

export class FirstMerge {
  /**
   * First times at which merge events with {@link FirstMergeRecorder#from}
   * are recorded so far. This will contain the timestamp of the first
   * event, then the timestamp of the second, et cetera.
   */
  private at: ArrayList<number>;

  /**
   * Set of glyphs that touch {@link FirstMergeRecorder#from} at time
   * {@link #at}. In practice this will almost always contain just a
   * single glyph. Similarly to {@link #at}, this is a list that tracks
   * the set for the first, second, ... merge events.
   */
  private glyphs: ArrayList<ArrayList<Glyph>>;

  /**
   * Number of merges that have been recorded.
   */
  private size: number;

  constructor() {
    this.at = ArrayList.__new(
      Arrays.nCopies(Constants.MAX_MERGES_TO_RECORD, Number.POSITIVE_INFINITY)
    );
    // this.at = new ArrayList(Collections.nCopies(
    //     Constants.MAX_MERGES_TO_RECORD, Double.POSITIVE_INFINITY));
    this.glyphs = new ArrayList(Constants.MAX_MERGES_TO_RECORD);
    for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
      this.glyphs.add(new ArrayList(1));
    }
    this.size = 0;
    if (LOGGER !== null) {
      LOGGER.log(Level.FINER, `constructed an empty FirstMerge #${this}`);
    }
  }

  public accept(parent: FirstMergeRecorder, candidate: Glyph): void {
    if (LOGGER != null) {
      LOGGER.log(Level.FINER, `accepting ${candidate} into #${this}`);
      // LOGGER.log(Level.FINER, "accepting {0} into #{1}",
      //     new Object[]{candidate, hashCode()});
    }
    const at = GrowFunction.__intersectAtGlyphGlyph(parent._from!, candidate);
    for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
      if (at < this.at.get(i)) {
        if (!Number.isFinite(this.at.get(i))) {
          this.size++;
        }
        // make room to shift, if needed
        if (this.at.size() === Constants.MAX_MERGES_TO_RECORD) {
          this.at.removeI(this.at.size() - 1);
          this.glyphs.addI(i, this.glyphs.removeI(this.glyphs.size() - 1));
        }
        this.at.addI(i, at);
        this.glyphs.get(i).clear();
        this.glyphs.get(i).add(candidate);
        break;
      } else if (at == this.at.get(i)) {
        this.glyphs.get(i).add(candidate);
        break;
      }
      // if at > this.at.get(i), try next i...
    }
    if (LOGGER != null) {
      LOGGER.log(
        Level.FINER,
        `#${this} now has glyphs ${this.glyphs.toArray().join(', ')} at [${this.at.toArray().join(', ')}]`
      );
      // LOGGER.log(Level.FINER, "#{0} now has glyphs {1} at {2}",
      //     new Object[]{
      //     hashCode(),
      //     "[" + glyphs.stream().map((glyphSet) ->
      //         glyphSet.stream().map(Glyph::toString).collect(
      //             Collectors.joining(", "))
      //     ).collect(Collectors.joining("], [")) + "]",
      //     "[" + this.at.stream().map(Object::toString).collect(
      //         Collectors.joining(", ")) + "]"
      // });
    }
  }

  combine(that: FirstMerge) {
    if (LOGGER != null) {
      LOGGER.log(
        Level.FINER,
        `combining #${this} and #${that};
#${this} has glyphs ${this.glyphs.toArray()} at ${this.at.toArray()};
#${that} has glyphs ${that.glyphs.toArray()} at ${that.at.toArray()}`
      );
      // LOGGER.log(Level.FINER,
      //     "combining #{0} and #{1};\n#{0} has glyphs {2} at {3};\n#{1} has glyphs {4} at {5}",
      //     new Object[]{hashCode(), that.hashCode(),
      // "[" + this.glyphs.stream().map((glyphSet) ->
      //     glyphSet.stream().map(Glyph::toString)
      //         .collect(
      //             Collectors.joining(", "))
      // ).collect(Collectors.joining("], [")) + "]",
      // "[" + this.at.stream().map(Object::toString).collect(
      //     Collectors.joining(", ")) + "]",
      // "[" + that.glyphs.stream().map((glyphSet) ->
      //     glyphSet.stream().map(Glyph::toString)
      //         .collect(
      //             Collectors.joining(", "))
      // ).collect(Collectors.joining("], [")) + "]",
      // "[" + that.at.stream().map(Object::toString).collect(
      //     Collectors.joining(", ")) + "]"
      // });
    }
    let thisInd = 0;
    let thatInd = 0;
    let result = new FirstMerge();

    for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
      // need to be careful here that we don't have both lists
      // reference the same sublist; won't go well with resetting
      if (that.at.get(thatInd) < this.at.get(thisInd)) {
        Utils.swap(result.at, i, that.at, thatInd);
        Utils.swap(result.glyphs, i, that.glyphs, thatInd);
        thatInd++;
      } else if (that.at.get(thatInd) === this.at.get(thisInd) && that.at.get(thatInd) !== Number.POSITIVE_INFINITY) {
        // because in JAVA it's
        //! } else if (that.at.get(thatInd) == this.at.get(thisInd)) {
        // AND NOT
        //! } else if (that.at.get(thatInd).equals(this.at.get(thisInd))) {
        Utils.swap(result.at, i, that.at, thatInd);
        Utils.swap(result.glyphs, i, that.glyphs, thatInd);
        result.glyphs.get(i).addAll(this.glyphs.get(thisInd).toArray());
        thisInd++;
        thatInd++;
      } else {
        // that.at.get(thatInd > this.at.get(thisInd)
        Utils.swap(result.at, i, this.at, thisInd);
        Utils.swap(result.glyphs, i, this.glyphs, thisInd);
        thisInd++;
      }
      result.size++;
    }
    if (LOGGER != null) {
      LOGGER.log(
        Level.FINER,
        `result #${result} of merging #${this} and ${that} has glyphs ${result.glyphs.toArray()} at ${result.at.toArray()} (storing in #${this} now)`
      ); // LOGGER.log(Level.FINER,
      //     "result #{0} of merging #{3} and #{4} has glyphs {1} at {2} (storing in #{3} now)",
      //     new Object[]{
      //     result.hashCode(),
      //     "[" + result.glyphs.stream().map((glyphSet) ->
      //         glyphSet.stream().map(Glyph::toString)
      //             .collect(
      //                 Collectors.joining(", "))
      //     ).collect(Collectors.joining("], [")) + "]",
      //     "[" + result.at.stream().map(Object::toString).collect(
      //         Collectors.joining(", ")) + "]",
      //         this.hashCode(), that.hashCode()
      // });
    }
    // swap properties with result
    const tmpAt = this.at;
    this.at = result.at;
    result.at = tmpAt;
    const tmpGlyphs = this.glyphs;
    this.glyphs = result.glyphs;
    result.glyphs = tmpGlyphs;
    // as we reset result and primitive is copied anyway, no need to swap
    this.size = result.size;
    // reset result, ready for reuse
    result.reset();
    return this;
  }

  getGlyphs() {
    return this.glyphs.get(0);
  }

  reset(): void {
    this.resizeIfNeeded();
    for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
      this.at.set(i, Number.POSITIVE_INFINITY);
      this.glyphs.get(i).clear();
    }
    this.size = 0;
  }

  resizeIfNeeded(): void {
    let ws = Constants.MAX_MERGES_TO_RECORD;
    let cs = this.at.size();
    if (cs < ws) {
      for (let i = cs; i < ws; ++i) {
        this.at.add(Number.POSITIVE_INFINITY);
        this.glyphs.add(new ArrayList(1));
      }
    } else if (cs > ws) {
      for (let i = cs - 1; i >= ws; --i) {
        this.at.removeI(i);
        this.glyphs.removeI(i);
      }
    }
  }

  pop(parent: FirstMergeRecorder): GlyphMerge[] | null {
    if (this.size === 0) {
      return null;
    }

    const at = this.at.get(0);
    Arrays.rotate(this.at, -1);
    // Collections.rotate(this.at, -1);
    const glyphs = this.glyphs.get(0);
    Arrays.rotate(this.glyphs, -1);
    // Collections.rotate(this.glyphs, -1);
    this.size--;

    const result: GlyphMerge[] = new Array(glyphs.size());
    let i = 0;
    for (const wth of glyphs) {
      result[i++] = new GlyphMerge(
        parent._from!,
        wth,
        Constants.ROBUST ? GrowFunction.intersectAt(parent._from!, wth) : at
      );
    }
    return result;
  }
}

export class FirstMergeRecorder {
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
  public static getInstance(): FirstMergeRecorder {
    return this.INSTANCE ?? (this.INSTANCE = new FirstMergeRecorder());
  }

  /**
   * Collector for stream operations.
   */
  private static collector: (glyphs: Glyph[]) => FirstMerge;

  /**
   * Singleton instance.
   */
  private static INSTANCE: FirstMergeRecorder;

  private static readonly REUSABLE_RECORDS: ArrayDeque<FirstMerge> = new ArrayDeque();

  private static firstReusedRecord: FirstMerge | null = null;

  /**
   * Returns an instance of {@link FirstMerge} that is {@link FirstMerge#reset()}
   * and ready to accept and combine. This method may cache instances and reuse
   * them. {@link #REUSABLE_RECORDS} is used to this end.
   */
  private static newInstance(): FirstMerge {
    // attempt to use cache
    if (
      this.REUSABLE_RECORDS.size() > 0 &&
      (this.firstReusedRecord == null ||
        this.REUSABLE_RECORDS.getLast() !== this.firstReusedRecord)
    ) {
      const record = this.REUSABLE_RECORDS.pollLast()!;
      this.REUSABLE_RECORDS.addFirst(record);
      if (this.firstReusedRecord == null) {
        this.firstReusedRecord = record;
      }
      return record;
    }
    // we are forced to create a new instance, do so
    const record = new FirstMerge();
    this.REUSABLE_RECORDS.addFirst(record);
    if (this.firstReusedRecord == null) {
      this.firstReusedRecord = record;
    }
    return record;
  }

  /**
   * Glyph with which merges are recorded.
   */
  _from: Glyph | null;

  /**
   * Container that records when the first merge(s) occur(s), and which glyph(s)
   * will merge with {@link #_from} at that point in time.
   */
  private readonly merge: FirstMerge;

  private constructor() {
    this._from = null;
    this.merge = new FirstMerge();
  }

  /**
   * @see #addEventsTo(MultiQueue, Logger)
   */
  public addEventsTo(q: MultiQueue): void;
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
  public addEventsTo(q: MultiQueue, l: Logger | null): void;
  public addEventsTo(q: MultiQueue, l: Logger | null = null): void {
    let merges: GlyphMerge[];
    if (Constants.ROBUST) {
      for (const glyph of this.merge.getGlyphs()) {
        q.add(new GlyphMerge(this._from!, glyph));
      }
      this.merge.getGlyphs().clear();
    } else {
      while ((merges = this.merge.pop(this)!) != null) {
        for (const merge of merges) {
          if (LOGGER !== null) {
            LOGGER.log(Level.FINE, `recorded ${merge}`);
          }
          this._from!.record(merge);
        }
      }
      this._from!.popMergeInto(q, l);
    }
    FirstMergeRecorder.firstReusedRecord = null; // we can reuse all records again
  }

  collector(): (glyphs: Glyph[]) => FirstMerge {
    if (FirstMergeRecorder.collector == null) {
      FirstMergeRecorder.collector = (glyphs: Glyph[]) => {
        return glyphs.reduce<FirstMerge>(
          (m, g) => (m.accept(this, g), m),
          FirstMergeRecorder.newInstance()
        );
      };
      // FirstMergeRecorder.collector = Collector.of(
      //     FirstMergeRecorder.newInstance(),
      //     (m, g) => m.accept(g),
      //     (a, b) => a.combine(b),
      //     Characteristics.UNORDERED);
    }
    return FirstMergeRecorder.collector;
  }

  /**
   * Start recording possible merges with the given glyph, forgetting about
   * all previous state.
   *
   * @param from Glyph with which merges should be recorded starting now.
   */
  public from(from: Glyph): void {
    if (LOGGER !== null) {
      LOGGER.log(Level.FINE, `recording merges from ${from}`);
    }
    this._from = from;
    this.merge.reset();
  }

  /**
   * {@link #record Record} all glyphs in the given stream, as long as
   * they are  and not {@link #from}.
   * <p>
   * This method may use parallelization to speed up recording.
   *
   * @param glyphs Stream of glyphs to record.
   * @deprecated
   */
  public record(glyphs: Stream<Glyph>): void;
  /**
   * {@link #record Record} all glyphs in the given set, as long as
   * they are  and not {@link #from}.
   * <p>
   * This method may use parallelization to speed up recording.
   *
   * @param glyphs Set of glyphs to record.
   * @deprecated
   */
  public record(glyphs: ArrayList<Glyph>): void;
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
  public record(glyphs: Glyph[], from: number, upto: number): void;
  /**
   * @deprecated
   * @param glyphs
   * @param from
   * @param upto
   */
  public record(
    glyphs: Glyph[] | Stream<Glyph> | ArrayList<Glyph>,
    from?: number,
    upto?: number
  ): void {
    if (Array.isArray(glyphs) && from !== undefined && upto !== undefined) {
      return this.__recordGlyphNumberNumber(glyphs, from, upto);
    } else if (glyphs instanceof Stream) {
      return this.__recordStream(glyphs);
    } else if (glyphs instanceof ArrayList) {
      return this.__recordArrayList(glyphs);
    }

    throw new Error("failed to find a way");
  }

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
  public __recordGlyphNumberNumber(
    glyphs: Glyph[],
    from: number,
    upto: number
  ): void {
    this.__recordStream(Arrays.stream(glyphs, from, upto));
  }

  /**
   * {@link #record Record} all glyphs in the given set, as long as
   * they are  and not {@link #from}.
   * <p>
   * This method may use parallelization to speed up recording.
   *
   * @param glyphs Set of glyphs to record.
   */
  public __recordArrayList(glyphs: ArrayList<Glyph>) {
    if (glyphs != null) {
      this.__recordStream(glyphs.stream());
    }
  }

  /**
   * {@link #record Record} all glyphs in the given stream, as long as
   * they are  and not {@link #from}.
   * <p>
   * This method may use parallelization to speed up recording.
   *
   * @param glyphs Stream of glyphs to record.
   */
  public __recordStream(glyphs: Stream<Glyph>) {
    if (Constants.ROBUST) {
      this.merge.getGlyphs().addAll(
        glyphs
          .parallel()
          .filter((glyph) => glyph.isAlive() && glyph !== this._from)
          .collect(Collectors.toSet())
      );
    } else {
      this.merge.combine(
        glyphs
          .filter((glyph) => glyph.isAlive() && glyph !== this._from)
          .collect(this.collector())
      );
    }
  }

  recordAllPairs(cell: QuadTree, q: MultiQueue): void {
    const glyphs = cell.getGlyphs()!.toArray();
    for (let i = 0; i < glyphs.length; ++i) {
      // add events for when two glyphs in the same cell touch
      this.from(glyphs[i]);
      Timers.start("first merge recording 5");
      this.__recordGlyphNumberNumber(glyphs, i + 1, glyphs.length);
      Timers.stop("first merge recording 5");
      this.addEventsTo(q);
    }
  }
}
