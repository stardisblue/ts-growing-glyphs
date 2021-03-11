import {Constants} from "./Constants";
import {Level, Logger} from "./Logger";
import {MultiQueue} from "./MultiQueue";
import {PriorityQueue} from "./PriorityQueue";
import {QuadTree} from "./QuadTree";
import {GlyphMerge} from "./GlyphMerge";
import TinyQueue from "tinyqueue";
import {Event} from "./Event";

export class Glyph {
    track: boolean;
    trackedBy: any[] | null;
    x: number;
    y: number;
    n: number;
    alive: number;
    big: boolean;
    cells: any[];
    uncertainMergeEvents: null;
    adoptedBy: null;
    mergeEvents: TinyQueue<GlyphMerge>;
    outOfCellEvents: any;

    constructor(x: number, y: number, n: number, alive: boolean = false) {
        if (n < 1) throw new Error("n must be at least 1");

        this.track = false;
        if (Constants.TRACK && !Constants.ROBUST) {
            this.trackedBy = [];
        } else {
            this.trackedBy = null;
        }
        this.x = x;
        this.y = y;
        this.n = n;
        this.alive = alive ? 1 : 0;
        this.big = false;
        this.cells = [];
        this.uncertainMergeEvents = null;
        this.adoptedBy = null;
        this.mergeEvents = new PriorityQueue(Constants.MAX_MERGES_TO_RECORD);
        this.outOfCellEvents = new PriorityQueue();
    }

    record(event: GlyphMerge) {
        this.mergeEvents.push(event);
    }

    popOutOfCellInto(q: MultiQueue, LOGGER: Logger) {
        throw new Error("Method not implemented.");
    }

    isAlive(): unknown {
        return this.alive === 1;
    }

    /**
     * @deprecated
     * @see #n
     */
    getN() {
        throw new Error("Method not implemented.");
    }

    addCell(cell: QuadTree) {
        if (!this.cells.includes(cell)) {
            this.cells.push(cell);
        }
    }

    accept(g: Glyph) {
        throw new Error("Method not implemented.");
    }

    /**
     * Returns whether this glyph and the given one share both X- and Y-
     * coordinates. This is checked using
     * {@link Utils.Double#eq(double, double)}, so with an epsilon.
     *
     * @param that Glyph to consider.
     */
    hasSamePositionAs(that: Glyph) {
        return this.x === that.x && this.y === that.y;
    }

    popMergeInto(q: TinyQueue<Event>, l: Logger) {
        if (this.big) throw new Error("big glyphs don't pop merge events into the shared queue");
        // try to pop a merge event into the queue as long as the previously
        // recorded merge is with a glyph that is still alive... give up as
        // soon as no recorded events remain

        while (this.mergeEvents.length !== 0) {
            const merge = this.mergeEvents.pop();
            const wth = merge.getOther(this);
            if (!wth.isAlive() || wth.big) {
                continue; // try next event
            }
            q.push(merge);
            if (Constants.TRACK && !Constants.ROBUST) {
                if (!wth.trackedBy.includes(this)) {
                    wth.trackedBy.push(this);
                }
            }
            if (l !== null) {
                l.log(Level.FINEST, `→ merge at ${merge.at} with ${wth}`);
            }
            // we found an event and added it to the queue, return
            return true;

        }
        // no recorded events remain, we cannot add an event
        return false;
    }

    /**
     * @deprecated use {@link #big}
     * @private
     */
    private isBig() {
        return this.big;
    }
}
