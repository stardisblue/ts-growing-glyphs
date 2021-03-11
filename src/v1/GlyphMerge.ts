import {Event} from "./Event";
import {Glyph} from "./Glyph";
import {GrowFunction} from "./GrowFunction";
import {Type} from "./Type";

export class GlyphMerge extends Event {


    constructor(a: Glyph, b: Glyph, at?: number) {
        super(at ?? GrowFunction.intersectAtG(a, b), 2);
        this.glyphs[0] = a;
        this.glyphs[1] = b;

    }

    getType() {
        return Type.MERGE;
    }

    getOther(glyph: Glyph) {
        if(this.glyphs[0] === glyph){
            return this.glyphs[1]
        }
        return this.glyphs[0]
    }
}