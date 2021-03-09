import {Constants} from "./Constants";
import {Glyph} from "./Glyph";
import {Level, Logger} from "./Logger";

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
        this.at = Array.from({length: Constants.MAX_MERGES_TO_RECORD}, ()=> Number.POSITIVE_INFINITY)
        this.glyphs = new Array(Constants.MAX_MERGES_TO_RECORD)
        for(let i  = 0; i < Constants.MAX_MERGES_TO_RECORD; ++i){
            this.glyphs[i] = new Array(1)
        }
        this.size = 0
        if(LOGGER !== null){
            LOGGER.log(Level.FINER, `constructed an empty FirstMerge`)
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
        const ws = Constants.MAX_MERGES_TO_RECORD
        const cs = this.at.length
        if(cs < ws){
            for (let i = cs; i < ws; ++i) {
                this.at.push(Number.POSITIVE_INFINITY)
                this.glyphs.push(new Array(1))
            }
        }else if (cs > ws){
            for (let i = cs -1; i >= ws; --i) {
                this.at.splice(i, 1)
                this.glyphs.splice(i, 1)
            }
        }

    }
}
