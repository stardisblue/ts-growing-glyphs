import {FirstMerge} from "./FirstMerge";
import {Glyph} from "./Glyph";
import {Level, Logger} from "./Logger";
import {MultiQueue} from "./MultiQueue";
import {Constants} from "./Constants";

function l() {
    let l: Logger;

    if (Constants.LOGGING_ENABLED && ((l = new Logger()).isLoggable(Level.FINER)))
        return l;
    return null;
}

const LOGGER = l();

export class FirstMergeRecorder {
    merge: FirstMerge;
    private _from: Glyph;


    constructor() {
        this._from = null;
        this.merge = new FirstMerge();
    }

    static getInstance(): FirstMergeRecorder {
        return INSTANCE;
    }

    addEventsTo(q: MultiQueue, LOGGER: Logger) {
        throw new Error("Method not implemented.");
    }

    record(glyphs: Glyph[], arg1: number, length: number) {
        throw new Error("Method not implemented.");
    }

    from(from: Glyph) {
        if (LOGGER !== null) LOGGER.log(Level.FINE, `recording merges from ${from}`)

        this._from = from
        this.merge.reset()
            throw new Error("Method not implemented.");
    }
}

const INSTANCE = new FirstMergeRecorder();
