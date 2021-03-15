import {QuadTree} from "../../datastructure/QuadTree";
import {Constants} from "../../utils/Constants";
import {Level, Logger} from "../../java/Logger";
import {Glyph} from "../../datastructure/Glyph";
import {PriorityQueue} from "../../java/PriorityQueue";
import {GlyphMerge} from "../../datastructure/events/GlyphMerge";
import {ArrayList} from "../../java/ArrayList";
import {GrowFunction} from "../../datastructure/growfunction/GrowFunction";
import {HierarchicalClustering} from "../../datastructure/HierarchicalClustering";
import {FirstMergeRecorder} from "../FirstMergeRecorder";
import {Stats, Timers, Utils} from "../../utils/Utils";
import {MultiQueue} from "../../datastructure/queues/MultiQueue";
import {HashMap} from "../../java/HashMap";
import {Side} from "../../datastructure/events/Side";
import {OutOfCell} from "../../datastructure/events/OutOfCell";
import {Event} from "../../datastructure/events/Event";
import {Type} from "../../datastructure/events/Type";
import {Stat} from "../../utils/Stat";

/**
 * Object that is used to easily share state between
 * {@link QuadTreeClusterer#cluster() cluster} and
 * PriorityQueue) handleGlyphMerge}.
 */
class GlobalState {
  // we have a queue for nested merges, and a temporary array that is reused,
  // and two sets that are reused somewhere deep in the algorithm
  readonly nestedMerges: PriorityQueue<GlyphMerge> = new PriorityQueue();
  readonly createdFromTmp: [HierarchicalClustering, HierarchicalClustering] = [
    null,
    null,
  ] as any;
  readonly trackersNeedingUpdate: ArrayList<Glyph> = new ArrayList();
  readonly orphanedCells: ArrayList<QuadTree> = new ArrayList();
  // mapping from glyphs to (currently) highest level nodes in resulting clustering
  readonly map: HashMap<Glyph, HierarchicalClustering>;
  // finally, create an indication of which glyphs still participate
  numAlive = 0;
  // statistic for sizes of currently alive glyphs
  readonly glyphSize: Stat = new Stat();
  // list of alive big glyphs; these are not in the QuadTree and thus tracked separately
  readonly bigGlyphs: ArrayList<Glyph> = new ArrayList(2);
  // used as output parameter of #processNestedMerges to indicate if a big glyph was merged
  mergedBigGlyph: boolean = false;

  constructor(map: HashMap<Glyph, HierarchicalClustering>) {
    this.map = map;
  }
}

const LOGGER = Constants.LOGGING_ENABLED
  ? Logger.getLogger("QuadTreeClusterer")
  : null;

export class QuadTreeClusterer {
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
  private rec: FirstMergeRecorder | null;

  constructor(tree: QuadTree) {
    this.tree = tree;
    this.result = null;
    this.rec = null;
  }

  cluster(): QuadTreeClusterer {
    // for debugging only: checking the number of glyphs/entities
    const defaultLevel = LOGGER == null ? null : LOGGER.getLevel();

    if (LOGGER != null) {
      LOGGER.log(Level.FINER, "ENTRY into AgglomerativeClustering#cluster()");
      LOGGER.log(
        Level.FINE,
        `clustering using ${Utils.join(
          " + ",
          Constants.ROBUST ? "ROBUST" : "",
          Constants.TRACK && !Constants.ROBUST ? "TRACK" : "",
          !Constants.ROBUST && !Constants.TRACK ? "FIRST MERGE ONLY" : "",
          "NO BUCKETING"
        )} strategy`
      );
      // LOGGER.log(Level.FINE, "clustering using {0} strategy", Utils.join(" + ",
      //     (Constants.ROBUST ? "ROBUST" : ""),
      //     (Constants.TRACK && !Constants.ROBUST ? "TRACK" : ""),
      //     (!Constants.ROBUST && !Constants.TRACK ? "FIRST MERGE ONLY" : ""),
      //     "NO BUCKETING"));
      LOGGER.log(
        Level.FINE,
        "using the Linear Area Growing Circles grow function"
      );
      LOGGER.log(
        Level.FINE,
        `QuadTree has ${this.tree.getSize()} nodes and height ${this.tree.getTreeHeight()}, having at most ${
          Constants.MAX_GLYPHS_PER_CELL
        } glyphs per cell and cell size at least ${Constants.MIN_CELL_SIZE.toExponential()}`
      );
      // LOGGER.log(Level.FINE, "QuadTree has {0} nodes and height {1}, having "
      //     + "at most {2} glyphs per cell and cell size at least {3}",
      //     new Object[]{tree.getSize(), tree.getTreeHeight(),
      //     Constants.MAX_GLYPHS_PER_CELL, Double.toString(Constants.MIN_CELL_SIZE)});
      if (LOGGER.isLoggable(Level.FINE)) {
        let n = 0;
        for (const leaf of this.tree.__getLeaves()) {
          Stats.record("glyphs per cell", leaf.getGlyphs()!.size());
          for (const glyph of leaf.getGlyphs()!) {
            n += glyph.getN();
          }
        }
        Stats.record("total # works", n);
      }
    }
    if (Constants.TIMERS_ENABLED) {
      Timers.start("clustering");
    }
    // construct a queue, put everything in there - 10x number of glyphs
    // appears to be a good estimate for needed capacity without bucketing
    const q = new MultiQueue(10 * Utils.size(this.tree.iteratorGlyphsAlive()));
    // also create a result for each glyph, and a map to find them
    const map = new HashMap<Glyph, HierarchicalClustering>();
    // then create a single object that is used to find first merges
    this.rec = FirstMergeRecorder.getInstance();
    // group temporary and shared variables together in one object to reduce
    // the number of parameters to #handleGlyphMerge
    const state = new GlobalState(map);
    // start recording merge events
    const rect = this.tree.getRectangle();
    for (const leaf of this.tree.__getLeaves()) {
      const glyphs = leaf.getGlyphs()!.toArray();
      for (let i = 0; i < glyphs.length; ++i) {
        // add events for when two glyphs in the same cell touch
        if (LOGGER !== null) LOGGER.log(Level.FINEST, glyphs[i].toString());
        this.rec.from(glyphs[i]);
        if (Constants.TIMERS_ENABLED) Timers.start("first merge recording 1");
        this.rec.__recordGlyphNumberNumber(glyphs, i + 1, glyphs.length);
        if (Constants.TIMERS_ENABLED) Timers.stop("first merge recording 1");
        this.rec.addEventsTo(q, LOGGER);

        // add events for when a glyph grows out of its cell
        for (const side of Side.values()) {
          // only create an event when it is not a border of the root
          if (!Utils.onBorderOf(leaf.getSide(side), rect)) {
            // now, actually create an OUT_OF_CELL event
            glyphs[i].record(new OutOfCell(glyphs[i], leaf, side));
          }
        }
        glyphs[i].popOutOfCellInto(q, LOGGER);

        // create clustering leaves for all glyphs, count them as alive
        map.put(glyphs[i], new HierarchicalClustering(glyphs[i], 0));
        state.numAlive++;
        state.glyphSize.record(glyphs[i].getN());
        if (!glyphs[i].isAlive()) {
          if (LOGGER != null) {
            LOGGER.log(Level.SEVERE, "unexpected dead glyph in input");
          }
          return null;
        }
      }
    }
    if (LOGGER != null) {
      LOGGER.log(
        Level.FINE,
        `created ${q.size()} events initially, for ${state.numAlive} glyphs`
      );
      // LOGGER.log(Level.FINE, "created {0} events initially, for {1} glyphs",
      //     new Object[]{q.size(), state.numAlive});
    }
    // merge glyphs until no pairs to merge remain
    let e: Event;
    while ((e = this.getNextEvent(q, state)) !== null) {
      // log on a slightly higher urgency level when one of the glyphs is tracked
      if (LOGGER !== null) {
        if (LOGGER.getLevel() > Level.FINER) {
          for (const glyph of e.getGlyphs()) {
            if (glyph.track) {
              LOGGER.setLevel(Level.FINEST);
              break;
            }
          }
        }
        // log about handling this event
        LOGGER.log(
          Level.FINER,
          `handling ${e.getType()} at ${e.getAt().toFixed(3)} involving`
        );
        // LOGGER.log(Level.FINER, "handling {0} at {1} involving",
        //     new Object[]{e.getType(), e.getAt()});
        for (const glyph of e.getGlyphs()) {
          LOGGER.log(Level.FINER, glyph.toString());
        }
      }
      // depending on the type of event, handle it appropriately
      // determine whether one of the glyphs is tracked
      // check if one of the glyphs is big; if so, handle separately
      // handle the merge either normally, or as a big glyph merge
      switch (e.getType()) {
        case Type.MERGE: {
          let track = false;
          for (const glyph of e.getGlyphs()) {
            track = track || glyph.track;
          }
          let big = null;
          let bigBig = false;
          for (const glyph of e.getGlyphs()) {
            if (glyph.isBig()) {
              if (big == null) {
                big = glyph;
              } else {
                // if there is more than one big glyph involved,
                // handle it normally
                big = null;
                bigBig = true;
                break;
              }
            }
          }
          if (big === null) {
            if (bigBig) {
              Stats.count("merge big/big");
            } else {
              Stats.count("merge small/small");
            }
            this.handleGlyphMerge(e as GlyphMerge, state, q, track);
          } else {
            Stats.count("merge small/big");
            this.handleBigGlyphMerge(e as GlyphMerge, state, q, track);
          }
          break;
        }
        case Type.OUT_OF_CELL: {
          if (Constants.TIMERS_ENABLED)
            Timers.start("out of cell event processing");
          this.handleOutOfCell(e as OutOfCell, map, false, q);
          if (Constants.TIMERS_ENABLED)
            Timers.stop("out of cell event processing");
        }
      }
      this.step();

      // check ourselves, conditionally
      // reset higher log level for tracked glyphs, if applicable
      if (LOGGER !== null) LOGGER.setLevel(defaultLevel);
    }
    if (LOGGER != null) {
      if (LOGGER.isLoggable(Level.FINE)) {
        Stats.record("total # works", this.result.getGlyph().getN());
      }
      LOGGER.log(
        Level.FINE,
        `created ${q.getInsertions()} events, handled ${q.getDeletions()} and discarded ${q.getDiscarded()}; ${
          q.getInsertions() - q.getDeletions() - q.getDiscarded()
        } events were never considered`
      );
      // LOGGER.log(Level.FINE, "created {0} events, handled {1} and discarded "
      //     + "{2}; {3} events were never considered",
      //     new Object[]{q.getInsertions(), q.getDeletions(),
      //     q.getDiscarded(), q.getInsertions() - q.getDeletions() -
      // q.getDiscarded()});
      for (const t of Type.values()) {
        const tn = t.toString();
        const s = Stats.get(tn);

        LOGGER.log(
          Level.FINE,
          `→ ${s.getSum()} ${tn}s (${Stats.get(
            tn + " handled"
          ).getSum()} handled, ${Stats.get(
            tn + " discarded"
          ).getSum()} discarded)`
        );
        // LOGGER.log(Level.FINE, "→ {1} {0}s ({2} handled, {3} discarded)", new Object[]{
        //     tn, s.getSum(), Stats.get(tn + " handled").getSum(),
        //         Stats.get(tn + " discarded").getSum()});
        Stats.remove(tn);
        Stats.remove(tn + " handled");
        Stats.remove(tn + " discarded");
      }

      LOGGER.log(
        Level.FINE,
        `events were stored in ${q.getNumQueues()} queue(s)`
      );
      // LOGGER.log(Level.FINE, "events were stored in {0} queue(s)", q.getNumQueues());
      LOGGER.log(
        Level.FINE,
        `QuadTree has ${this.tree.getSize()} nodes and height ${this.tree.getTreeHeight()} now`
      );
      // LOGGER.log(Level.FINE, "QuadTree has {0} nodes and height {1} now",
      //     new Object[]{tree.getSize(), tree.getTreeHeight()});
      Stats.logAll(LOGGER);
    }
    if (Constants.TIMERS_ENABLED) Timers.logAll(LOGGER);
    if (LOGGER != null)
      LOGGER.log(Level.FINER, "RETURN from AgglomerativeClustering#cluster()");
    return this;
  }

  public getName(): string {
    return "QuadTree Clusterer";
  }

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
  private findOverlap(
    wth: Glyph,
    at: number,
    addTo: PriorityQueue<GlyphMerge>,
    bigGlyphs: ArrayList<Glyph>
  ): boolean {
    let foundOverlap = false;

    // check glyphs in cells of the given glyph
    let bAt; // before `at`, used to store time/zoom level of found merges
    for (const cell of this.tree.__getLeavesGlyphAt(wth, at)) {
      for (const glyph of cell.getGlyphsAlive()) {
        if ((bAt = GrowFunction.intersectAt(wth, glyph)) <= at) {
          foundOverlap = true;
          addTo.add(new GlyphMerge(null, glyph, bAt));
        }
      }
    }

    // also check big glyphs separately
    for (const big of bigGlyphs) {
      if (big != wth && (bAt = GrowFunction.intersectAt(wth, big)) <= at) {
        foundOverlap = true;
        addTo.add(new GlyphMerge(null, big, bAt));
      }
    }

    return foundOverlap;
  }

  /**
   * Returns the first event that will happen. Normally, this is the head of
   * the given {@link MultiQueue} (modulo discarded events). However, the queues
   * of {@linkplain GlobalState#bigGlyphs big glyphs} are also checked.
   *
   * @return The next event to occur, or {@code null} if there are no more
   * events to handle or only a single alive glyph left.
   */
  private getNextEvent(q: MultiQueue, s: GlobalState): Event {
    if (s.numAlive <= 1) {
      return null;
    }

    // check the queue
    let event: Event = null;
    let queueEvent: Event = null;
    findQueueEvent: while (!q.isEmpty()) {
      event = q.peek();
      // we ignore out of cell events for non-leaf cells
      if (
        event.getType() == Type.OUT_OF_CELL &&
        !(event as OutOfCell).getCell().isLeaf()
      ) {
        q.discard();
        continue;
      }
      // we ignore this event if not all glyphs from it are alive anymore
      for (const glyph of event.getGlyphs()) {
        if (!glyph.isAlive()) {
          q.discard();
          continue findQueueEvent;
        }
      }
      event = queueEvent = q.peek();
      break;
    }

    // check the big glyphs
    let bigGlyph = null;
    for (const big of s.bigGlyphs) {
      LOGGER?.log(Level.FINER, `searching for uncertain merge on ${big}`);
      const bEvt = big.peekUncertain();
      LOGGER?.log(Level.FINER, `found ${bEvt}`);
      if (event == null || (bEvt != null && bEvt.getAt() < event.getAt())) {
        event = bEvt.getGlyphMerge();
        bigGlyph = big;
      }
    }

    // if we are going with the queue event, remove it from the queue
    // otherwise remove it from the queue of the glyph it came from
    if (event !== null) {
      if (event === queueEvent) {
        q.poll();
      } else {
        bigGlyph.pollUncertain();
      }
    }

    return event;
  }

  private handleBigGlyphMerge(
    m: GlyphMerge,
    s: GlobalState,
    q: MultiQueue,
    track: boolean
  ) {
    if (Constants.TIMERS_ENABLED) {
      Timers.start("[merge event processing] big");
    }

    // process the merge and all merges that it causes
    const merged = this.processNestedMerges(m, s, q, track);

    // is the merged glyph not big anymore?
    if (!merged.isBig()) {
      // update queues of big glyphs
      for (const big of s.bigGlyphs) {
        big.record(new GlyphMerge(big, merged).uncertain());
      }

      // record merge events and out of cell events
      this.recordEventsForGlyph(merged, m.getAt(), q);
    } else {
      // we can adopt the merge events if it was a simple big/small merge
      // otherwise we need to rebuild from scratch
      if (s.mergedBigGlyph) {
        this.initializeBigGlyphEvents(merged, s);
      } else {
        // update merge events
        for (const glyph of m.getGlyphs()) {
          if (glyph.isBig()) {
            merged.adoptUncertainMergeEvents(glyph, m);
          }
        }
      }
    }

    // update bookkeeping
    this.recordGlyphAndStats(merged, s, track);

    if (Constants.TIMERS_ENABLED) {
      Timers.stop("[merge event processing] big");
    }
  }

  private handleGlyphMerge(
    m: GlyphMerge,
    s: GlobalState,
    q: MultiQueue,
    track: boolean
  ) {
    // process the merge and all merges that it causes
    const merged = this.processNestedMerges(m, s, q, track);

    // if the glyph became big now, it has not been inserted into the QuadTree
    // we need to initialize its queue in that case
    if (merged.isBig()) {
      this.initializeBigGlyphEvents(merged, s);
    } else {
      // update queues of big glyphs
      for (const big of s.bigGlyphs) {
        big.record(new GlyphMerge(big, merged).uncertain());
      }

      // record merge events and out of cell events
      this.recordEventsForGlyph(merged, m.getAt(), q);
    }

    // update bookkeeping
    this.recordGlyphAndStats(merged, s, track);
  }

  private handleOutOfCell(
    o: OutOfCell,
    map: HashMap<Glyph, HierarchicalClustering>,
    includeOutOfCell: boolean,
    q: MultiQueue
  ): void {
    const glyph = o.getGlyphs()[0];
    // possibly include the event
    if (
      includeOutOfCell &&
      Utils.Double.neq(map.get(glyph).getAt(), o.getAt())
    ) {
      const hc = new HierarchicalClustering(glyph, o.getAt(), map.get(glyph));
      map.put(glyph, hc);
    }
    // handle orphaned cells
    const cell = o.getCell().getNonOrphanAncestor();
    if (o.getCell() !== cell) {
      // if the event was for an internal border of this non-orphan cell,
      // we don't have to add merge events anymore
      if (
        !Utils.onBorderOf(o.getCell().getSide(o.getSide()), cell.getRectangle())
      ) {
        // we do need to add an event for when this glyph grows out of
        // the non-orphan cell, because that has not been done yet
        glyph.record(new OutOfCell(glyph, cell, o.getSide()));
        glyph.popOutOfCellInto(q, LOGGER);
        return; // nothing to be done anymore
      }
    }

    // because of the above check for the border being on the actual border of
    // the non-orphaned cell, the timestamp is exactly the same, so we do not
    // need to (re)calculate it
    const oAt = o.getAt();
    const oppositeSide = o.getSide().opposite();
    // create merge events with the glyphs in the neighbors
    // we take the size of the glyph at that point in time into account
    const sideInterval = Side.interval(
      GrowFunction.sizeAt(glyph, oAt).getBounds2D(),
      o.getSide()
    );
    if (LOGGER !== null)
      LOGGER.log(Level.FINER, `size at border is [${sideInterval}]`);
    // Copy the set of neighbors returned, as the neighbors may in fact change
    // while the out of cell event is being handled; inserting the glyph into
    // the neighboring cells can cause a split to occur and the neighbors to
    // update. All of that is avoided by making a copy now.
    const neighbors = cell.getNeighbors(o.getSide()).copy();
    // const neighbors = new ArrayList(cell.getNeighbors(o.getSide()));
    if (LOGGER !== null) {
      LOGGER.log(
        Level.FINEST,
        `growing out of ${o.getSide()} of ${o.getCell()} into`
      );
      // LOGGER.log(Level.FINEST, "growing out of {1} of {0} into",
      //     new Object[]{o.getCell(), o.getSide();});
    }
    for (const neighbor of neighbors) {
      if (LOGGER !== null) LOGGER.log(Level.FINEST, neighbor.toString());

      // ensure that glyph actually grows into this neighbor
      if (
        !Utils.intervalsOverlap(
          Side.interval(neighbor.getSide(oppositeSide), oppositeSide),
          sideInterval
        )
      ) {
        if (LOGGER !== null)
          LOGGER.log(
            Level.FINEST,
            "→ but not at this point in time, so ignoring"
          );
        continue;
      }

      // ensure that glyph was not in this cell yet
      if (
        neighbor.getGlyphs() !== null &&
        neighbor.getGlyphs().contains(glyph)
      ) {
        if (LOGGER !== null)
          LOGGER.log(Level.FINEST, "→ but was already in there, so ignoring");
        // there might still be other interesting events for this glyph
        glyph.popOutOfCellInto(q, LOGGER);
        continue;
      }

      // register glyph in cell(s) it grows into
      neighbor.insert(glyph, oAt);

      // split cell if necessary, to maintain maximum glyphs per cell
      let grownInto;
      if (
        neighbor.getGlyphs() !== null &&
        neighbor.getGlyphs().size() > Constants.MAX_GLYPHS_PER_CELL
      ) {
        // 1. split and move glyphs in cell to appropriate leaf cells
        //    (this may split the cell more than once!)
        neighbor.__splitAt(oAt);
        // 2. invalidate out of cell events with `neighbor`
        //    → done by discarding such events as they exit the queue
        //      (those events work on non-leaf cells; detectable)
        // 3. invalidate merge events across cell boundaries
        //    → not strictly needed; this may result in having multiple
        //      merge events for the same pair of glyphs, but once the
        //      first one is handled, the others are discarded
        // this step is currently not implemented
        // 4. continue with making events in appropriate cells instead
        //    of `neighbor` or all glyphs associated with `neighbor`
        grownInto = neighbor.__getLeavesGlyphAt(glyph, oAt);
        if (LOGGER !== null && LOGGER.isLoggable(Level.FINE)) {
          for (const iin of neighbor.__getLeaves()) {
            Stats.record("glyphs per cell", iin.getGlyphsAlive().size());
          }
        }
      } else {
        grownInto = neighbor.__getLeaves();
      }

      this.rec.from(glyph);
      for (const iin of grownInto) {
        // create merge events with glyphs in the cells the glyph grows
        // into - we must do this to get correctness
        Timers.start("first merge recording 4");
        this.rec.__recordArrayList(iin.getGlyphs());
        Timers.stop("first merge recording 4");

        // create out of cell events for the cells the glyph grows into,
        // but only when they happen after the current event
        for (const side of o.getSide().opposite().others()) {
          const at = GrowFunction.exitAt(glyph, iin, side);
          if (at >= oAt) {
            // only create an event when at least one neighbor on
            // this side does not contain the glyph yet
            let create = false;
            const neighbors2 = iin.getNeighbors(side);
            for (const neighbor2 of neighbors2) {
              if (!neighbor2.getGlyphs().contains(glyph)) {
                create = true;
                break;
              }
            }
            if (!create) {
              continue;
            }
            // now, actually create an OUT_OF_CELL event
            if (LOGGER !== null)
              //     LOGGER.log(Level.FINEST, "→ out of {0} of {2} at {1}",
              //          new Object[]{side, at, in});
              LOGGER.log(Level.FINEST, `→ out of ${side} of ${iin} at ${at.toFixed(3)}`);
            glyph.record(new OutOfCell(glyph, iin, side, at));
          }
        }
      }
      glyph.popOutOfCellInto(q, LOGGER);
      this.rec.addEventsTo(q, LOGGER);
    }
  }

  /**
   * Given a big glyph, create uncertain merge events with all other glyphs in
   * the QuadTree, and other big glyphs if there are any.
   */
  private initializeBigGlyphEvents(glyph: Glyph, s: GlobalState) {
    // other big glyphs
    for (const big of s.bigGlyphs) {
      glyph.record(new GlyphMerge(glyph, big).uncertain());
    }

    // non-big glyphs
    for (const small of Utils.iterable(this.tree.iteratorGlyphsAlive())) {
      glyph.record(new GlyphMerge(glyph, small).uncertain());
    }
  }

  /**
   * Given a merge event, see if performing it would cause more merges, and
   * process those repeatedly until no overlap remains. This function also
   * has glyphs that tracked any merged glyphs update who they track, and
   * inserts the merged glyph into the QuadTree. When the merging of glyphs
   * causes cells of the QuadTree to join, then new merge events are created
   * in those joined cells as well.
   */
  private processNestedMerges(
    m: GlyphMerge,
    s: GlobalState,
    q: MultiQueue,
    track: boolean
  ): Glyph {
    if (Constants.TIMERS_ENABLED) {
      Timers.start("[merge event processing] total");
      if (track) {
        Timers.start("[merge event processing] total (track)");
      }
    }
    s.nestedMerges.add(m);
    s.mergedBigGlyph = false;
    // create a merged glyph and ensure that the merged glyph does not
    // overlap other glyphs at this time - repeat until no more overlap
    let merged: Glyph| null = null;
    let mergedHC = null;
    let mergedAt = m.getAt();

    if (Constants.TIMERS_ENABLED) {
      Timers.start("[merge event processing] nested merges");
    }
    do {
      nestedMerge: while (!s.nestedMerges.isEmpty()) {
        m = s.nestedMerges.poll();

        // check that all glyphs in the merge are still alive
        for (const glyph of m.getGlyphs()) {
          if (glyph !== null && !glyph.isAlive()) {
            continue nestedMerge;
          }
        }

        if (LOGGER !== null) {
          LOGGER.log(Level.FINEST, "handling nested " + m);
        }

        // create a merged glyph, update clustering
        if (mergedHC === null) {
          merged = new Glyph(m.getGlyphs());
          mergedHC = new HierarchicalClustering(
            merged,
            mergedAt,
            ...Utils.map(m.getGlyphs(), s.map, s.createdFromTmp)
          );
        } else {
          mergedHC.alsoCreatedFrom(s.map.get(m.getGlyphs()[1])!);
          merged = new Glyph(merged!, m.getGlyphs()[1]);
          mergedHC.setGlyph(merged);
          if (m.getGlyphs()[1].isBig()) {
            s.mergedBigGlyph = true;
            Stats.count("merge nested big");
          } else {
            Stats.count("merge nested small");
          }
        }

        // mark merged glyphs as dead
        for (const glyph of m.getGlyphs()) {
          // we skip the `merged` glyph, see `#findOverlap`
          if (glyph === null || !glyph.isAlive()) {
            continue;
          }
          glyph.perish();
          s.numAlive--;
          s.glyphSize.unrecord(glyph.getN());
          if (glyph.isBig()) {
            s.bigGlyphs.remove(glyph);
          }
          // copy the set of cells the glyph is in currently, because we
          // are about to change that set and don't want to deal with
          // ConcurrentModificationExceptions...
          for (const cell of glyph.getCells().copy()) {
            if (cell.removeGlyph(glyph, mergedAt)) {
              // handle merge events (later, see below)
              s.orphanedCells.add(cell);
              // out of cell events are handled when they
              // occur, see #handleOutOfCell
            }
          }
          // update merge events of glyphs that tracked merged glyphs
          if (Constants.TRACK && !Constants.ROBUST) {
            for (const tracker of glyph.trackedBy) {
              if (!s.trackersNeedingUpdate.contains(tracker)) {
                s.trackersNeedingUpdate.add(tracker);
              }
            }
          }
        }

        if (LOGGER !== null) {
          LOGGER.log(Level.FINEST, `→ merged glyph is ${merged}`);
        }
      }
    } while (this.findOverlap(merged, mergedAt, s.nestedMerges, s.bigGlyphs));
    if (Constants.TIMERS_ENABLED) {
      Timers.stop("[merge event processing] nested merges");
      Timers.start("[merge event processing] merge events in joined cells");
    }
    // handle adding merge events in joined cells
    const uniqueValues = new Set<QuadTree>();
    for (const quadTree of s.orphanedCells) {
      const nonOrphanAncestor = quadTree.getNonOrphanAncestor();
      if (uniqueValues.add(nonOrphanAncestor)) {
        if (Constants.TIMERS_ENABLED)
          Timers.start("record all pairs");
        this.rec.recordAllPairs(nonOrphanAncestor.getNonOrphanAncestor(), q);
        if (Constants.TIMERS_ENABLED)
          Timers.stop("record all pairs");
      }
    }
    s.orphanedCells.clear();
    if (Constants.TIMERS_ENABLED) {
      Timers.stop("[merge event processing] merge events in joined cells");
      Timers.start("[merge event processing] tracker updating");
    }
    // update merge events of glyphs that tracked merged glyphs
    if (Constants.TRACK && !Constants.ROBUST) {
      for (const orphan of s.trackersNeedingUpdate) {
        if (orphan.isAlive()) {
          Stats.record("orphan cells", orphan.getCells().size());
          if (!orphan.popMergeInto(q, LOGGER)) {
            this.rec.from(orphan);
            if (Constants.TIMERS_ENABLED)
              Timers.start("first merge recording 2");
            for (const cell of orphan.getCells()) {
              this.rec.__recordArrayList(cell.getGlyphs());
            }
            if (Constants.TIMERS_ENABLED)
              Timers.stop("first merge recording 2");
            this.rec.addEventsTo(q, LOGGER);
          }
        }
      }
      s.trackersNeedingUpdate.clear();
    }
    if (Constants.TIMERS_ENABLED) {
      Timers.stop("[merge event processing] tracker updating");
      Timers.start("[merge event processing] merged glyph insert");
    }
    // add new glyph to QuadTree cell(s)
    merged.setBig(s.glyphSize);
    if (!merged.isBig()) {
      this.tree.insert(merged, mergedAt);
      if (LOGGER !== null) {
        LOGGER.log(
          Level.FINER,
          `inserted merged glyph into ${merged.getCells().size()} cells`
        );
      }
    }
    if (Constants.TIMERS_ENABLED) {
      Timers.stop("[merge event processing] merged glyph insert");
    }

    // eventually, the last merged glyph is the root
    s.map.put(merged, mergedHC);
    this.result = mergedHC;

    return merged;
  }

  private recordGlyphAndStats(
    merged: Glyph,
    s: GlobalState,
    track: boolean
  ): void {
    merged.participate();
    s.numAlive++;
    s.glyphSize.record(merged.getN());
    if (merged.isBig()) {
      Stats.record("merged cells big glyphs", merged.getCells().size());
      Stats.record(
        "glyphs around big glyphs",
        merged
          .getCells()
          .stream()
          .mapToInt((cell) => cell.getGlyphsAlive().size())
          .sum()
      );
      s.bigGlyphs.add(merged);
      Stats.record("number of big glyphs", s.bigGlyphs.size());
    }

    if (Constants.TIMERS_ENABLED) {
      Timers.stop("[merge event processing] total");
      if (track) {
        Timers.stop("[merge event processing] total (track)");
      }
    }
  }

  /**
   * Given a freshly created glyph originating from a merge, loop over the
   * QuadTree cells of that glyph and record out of cell events for all.
   * In the same loop, find merges as well, using the global {@link #rec}.
   */
  recordEventsForGlyph(merged: Glyph, at: number, q: MultiQueue) {
    if (Constants.TIMERS_ENABLED)
      Timers.start("[merge event processing] merge event recording");
    // create events with remaining glyphs
    // (we always have to loop over cells here, `merged` has just
    //  been created and thus hasn't recorded merge events yet)
    this.rec.from(merged);
    Stats.record("merged cells", merged.getCells().size());
    for (const cell of merged.getCells()) {
      if (Constants.TIMERS_ENABLED) Timers.start("first merge recording 3");
      this.rec.__recordArrayList(cell.getGlyphs());
      if (Constants.TIMERS_ENABLED) Timers.stop("first merge recording 3");
      // create out of cell events
      for (const side of Side.values()) {
        // only create an event when at least one neighbor on
        // this side does not contain the merged glyph yet
        let create = false;
        if (Constants.TIMERS_ENABLED) Timers.start("neighbor finding");
        const neighbors = cell.getNeighbors(side);
        if (Constants.TIMERS_ENABLED) Timers.stop("neighbor finding");
        for (const neighbor of neighbors) {
          if (!neighbor.getGlyphs().contains(merged)) {
            create = true;
            break;
          }
        }
        if (!create) {
          continue;
        }
        // now, actually create an OUT_OF_CELL event, but only
        // if the event is still about to happen
        const ooe = new OutOfCell(merged, cell, side);
        if (ooe.getAt() > at) {
          merged.record(ooe);
          if (LOGGER !== null)
            LOGGER.log(
              Level.FINEST,
              `→ out of ${side} of ${cell} at ${ooe.getAt().toFixed(3)}`
            );
        }
      }
    }
    merged.popOutOfCellInto(q, LOGGER);
    this.rec.addEventsTo(q, LOGGER);
    if (Constants.TIMERS_ENABLED)
      Timers.stop("[merge event processing] merge event recording");
  }

  /**
   * Executed right before going to the next iteration of the event handling
   * loop. Possibly pauses executiong, depending on parameter.
   */
  private step(): void {
    if (Constants.STATS_ENABLED) {
      Stats.record("QuadTree cells", Utils.size(this.tree.iterator()));
      Stats.record("QuadTree leaves", this.tree.__getLeaves().size());
      Stats.record("QuadTree height", this.tree.getTreeHeight());
    }
  }

  /**
   * Returns the latest result of executing the clustering algorithm. Initially
   * {@code null}.
   */
  public getClustering(): HierarchicalClustering {
    return this.result;
  }

  /**
   * Forget about any clustering obtained so far.
   */
  public reset(): void {
    this.result = null;
  }
}
