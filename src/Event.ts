import {Glyph} from "./Glyph";

export class Event {
    protected glyphs: Glyph[];
    private at: number;
    constructor(at: number, glyphCapacity: number) {
        this.at = at
        this.glyphs = new Array<Glyph>(glyphCapacity)
        throw new Error("To Implement");
    }
}
