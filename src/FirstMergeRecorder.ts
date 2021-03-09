import {FirstMerge} from './FirstMerge';
import {Glyph} from './Glyph';
import {Logger} from './Logger';
import {MultiQueue} from './MultiQueue';

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
        throw new Error('Method not implemented.');
    }

    record(glyphs: Glyph[], arg1: number, length: number) {
        throw new Error('Method not implemented.');
    }

    from(arg0: Glyph) {
        throw new Error('Method not implemented.');
    }
}

const INSTANCE = new FirstMergeRecorder();
