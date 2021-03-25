import { Glyph } from "../Glyph";
import { Type } from "./Type";
import { Event } from "./Event";
export declare class GlyphMerge extends Event {
    constructor(a: Glyph, b: Glyph, at?: number);
    getOther(glyph: Glyph): Glyph;
    getType(): Type;
}
//# sourceMappingURL=GlyphMerge.d.ts.map