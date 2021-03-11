import {Glyph} from "./Glyph";

export abstract class Event {
    protected glyphs: Glyph[];
    at: number;

    protected constructor(at: number, glyphCapacity: number) {
        this.at = at;
        this.glyphs = new Array<Glyph>(glyphCapacity);
        throw new Error("To Implement");
    }

    /**
     * @abstract
     */
    abstract getType()
}
