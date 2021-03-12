import {Glyph} from "./Glyph";
import {Level, Logger} from "./Logger";
import {Constants} from "./Constants";
import {GrowFunction} from "./GrowFunction";
import {Utils} from "./Utils";
import {Event} from "./Event";
import Queue from "tinyqueue";
import {GlyphMerge} from "./GlyphMerge";

function arrayRotate(arr, count) {
    count -= arr.length * Math.floor(count / arr.length);
    arr.push.apply(arr, arr.splice(0, count));
    return arr;
}

function l() {
    let l: Logger;

    if (Constants.LOGGING_ENABLED && ((l = new Logger()).isLoggable(Level.FINER)))
        return l;
    return null;
}

const LOGGER = l();

export class FirstMerge {
    private at: number[];
    private glyphs: Glyph[][];
    private size: number;

    constructor() {
        this.at = Array.from({length: Constants.MAX_MERGES_TO_RECORD}, () => Number.POSITIVE_INFINITY);
        this.glyphs = new Array(Constants.MAX_MERGES_TO_RECORD);
        for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
            this.glyphs[i] = new Array(1);
        }
        this.size = 0;
        if (LOGGER !== null) {
            LOGGER.log(Level.FINER, `constructed an empty FirstMerge`);
        }
    }

    reset() {
        this.resizeIfNeeded();
        for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
            this.at[i] = Number.POSITIVE_INFINITY;
            this.glyphs[i] = [];
        }
    }

    private resizeIfNeeded() {
        const ws = Constants.MAX_MERGES_TO_RECORD;
        const cs = this.at.length;
        if (cs < ws) {
            for (let i = cs; i < ws; ++i) {
                this.at.push(Number.POSITIVE_INFINITY);
                this.glyphs.push(new Array(1));
            }
        } else if (cs > ws) {
            for (let i = cs - 1; i >= ws; --i) {
                this.at.splice(i, 1);
                this.glyphs.splice(i, 1);
            }
        }

    }

    getGlyphs() {
        return this.glyphs[0];
    }

    glyphsClear() {
        this.glyphs = [];
    }

    combine(that: FirstMerge): FirstMerge {
        if (LOGGER !== null) {
            LOGGER.log(Level.FINER, `combining #${this} and#${that};
#${this} has ${this.glyphs} at ${this.at};
#${that} has ${that.glyphs} at ${this.at}`);
        }
        let thisInd = 0;
        let thatInd = 0;
        const result = new FirstMerge();
        for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i) {
            // need to be careful here that we don't have both lists
            // reference the same sublist; won't go well with resetting
            if (that.at[thatInd] < this.at[thisInd]) {
                Utils.swap(result.at, i, that.at, thatInd);
                Utils.swap(result.glyphs, i, that.glyphs, thatInd);
                thatInd++;
            } else if (that.at[thatInd] === this.at[thisInd]) {
                Utils.swap(result.at, i, that.at, thatInd);
                Utils.swap(result.glyphs, i, that.glyphs, thatInd);
                result.glyphs[i].push(...this.glyphs[thisInd]);
                thisInd++;
                thatInd++;
            } else {// that.at.get(thatInd > this.at.get(thisInd)
                Utils.swap(result.at, i, this.at, thisInd);
                Utils.swap(result.glyphs, i, this.glyphs, thisInd);
                thisInd++;
            }
            result.size++;
        }
        if (LOGGER !== null) {
            LOGGER.log(Level.FINER, `result #${result} of mergin #${this} and #${that} has glyphs ${result.glyphs} at ${result.at} (storing in #${this} now)`);
        }
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

    accept(parent: FirstMergeRecorder, candidate: Glyph) {
        if (LOGGER !== null) {
            LOGGER.log(Level.FINER, `accepting ${candidate} into #${this}`);
        }
        const at = GrowFunction.intersectAtG(parent._from, candidate);
        for (let i = 0; i < Constants.MAX_MERGES_TO_RECORD; i++) {
            if (at < this.at[i]) {
                if (!Number.isFinite(this.at[i])) {
                    this.size++;
                }
                // make room to shift, if needed
                if (this.at.length === Constants.MAX_MERGES_TO_RECORD) {
                    this.at.splice(this.at.length - 1, 1);
                    this.glyphs[i] = this.glyphs.splice(this.glyphs.length - 1, 1)[0];
                }
                this.at[i] = at;
                this.glyphs[i] = [candidate];
                break;
            } else if (at === this.at[i]) {
                this.glyphs[i].push(candidate);
                break;
            }
        }
        if (LOGGER !== null) {
            LOGGER.log(Level.FINER, `${this} now has glyphs [${this.glyphs.map((glyphSet) => glyphSet.map(g => g.toString()).join(", "))}] at [${this.at.map(o => o.toString()).join(", ")}]`);
        }
    }


    pop(parent: FirstMergeRecorder) {
        if (this.size === 0) {
            return null;
        }

        const at = this.at[0];
        arrayRotate(this.at, -1);
        const glyphs = this.glyphs[0];
        arrayRotate(this.glyphs, -1);
        this.size--;

        return glyphs.map(wth => new GlyphMerge(parent._from, wth, Constants.ROBUST ? GrowFunction.intersectAtG(parent._from, wth) : at));
    }
}


export class FirstMergeRecorder {
    merge: FirstMerge;
    _from: Glyph;
    private _collector: (glyphs: Glyph[]) => FirstMerge;
    private static readonly REUSABLE_RECORDS: FirstMerge[] = [];
    private static firstReusedRecord: FirstMerge | null = null;

    constructor() {
        this._from = null;
        this.merge = new FirstMerge();
    }

    static getInstance(): FirstMergeRecorder {
        return INSTANCE;
    }

    /**
     * Given the glyph {@link #from} which recording started, and all possible
     * merges that have been {@link #record(Glyph[], int, int) recorded} after that, one or
     * more merge events will occur first; those are added to the given queue by
     * this method. State is maintained, although it is recommended that this is
     * not used, only {@link #from} could be used to reset state and start over.
     *
     * @param q Queue to add merge events to.
     * @param l Logger to log events to, can be {@code null}.
     */
    addEventsTo(q: Queue<Event>, l: Logger = null) {
        let merges: GlyphMerge[];

        if (Constants.ROBUST) {
            for (const glyph of this.merge.getGlyphs()) {
                q.push(new GlyphMerge(this._from, glyph));
            }
            this.merge.glyphsClear();
        } else {
            while ((merges = this.merge.pop(this)) !== null) {
                for (const merge of merges) {
                    if (LOGGER !== null) {
                        LOGGER.log(Level.FINE, `recorded ${merge}`);
                    }
                    this._from.record(merge);
                }
            }
            this._from.popMergeInto(q, l);
        }
        FirstMergeRecorder.firstReusedRecord = null; // we can reuse all records again
        throw new Error("Method not implemented.");
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
    record(glyphs: Glyph[], from?: number, upto?: number) {
        if (from && upto) {
            glyphs = glyphs.slice(from, upto);
        }

        if (Constants.ROBUST) {
            this.merge.getGlyphs().push(...new Set<Glyph>(glyphs.filter((glyph) => glyph.isAlive() && glyph !== this._from)));
        } else {
            this.merge.combine(this.collector()(glyphs
                .filter((glyph) => glyph.isAlive() && glyph !== this._from)));
        }
    }


    /**
     * Start recording possible merges with the given glyph, forgetting about
     * all previous state.
     *
     * @param from Glyph with which merges should be recorded starting now.
     */
    from(from: Glyph) {
        if (LOGGER !== null) LOGGER.log(Level.FINE, `recording merges from ${from}`);

        this._from = from;
        this.merge.reset();
    }

    private collector() {
        if (this._collector === null) {
            this._collector = function (glyphs: Glyph[]) {
                return glyphs.reduce<FirstMerge>((m, g) => (m.accept(this, g), m),
                    FirstMergeRecorder.newInstance());
            };
        }
        return this._collector;
    }

    private static newInstance() {
        // attempt to use cache
        if (this.REUSABLE_RECORDS.length > 0 && (this.firstReusedRecord === null ||
            this.REUSABLE_RECORDS[this.REUSABLE_RECORDS.length - 1] !== this.firstReusedRecord)) {
            const record = this.REUSABLE_RECORDS.pop();
            this.REUSABLE_RECORDS.unshift(record);
            if (this.firstReusedRecord === null) {
                this.firstReusedRecord = record;
            }
            return record;
        }
        // we are forced to create a new instance, do so
        const record = new FirstMerge();
        this.REUSABLE_RECORDS.unshift(record);
        if (this.firstReusedRecord === null) {
            this.firstReusedRecord = record;
        }

        return record;


    }
}

const INSTANCE = new FirstMergeRecorder();
