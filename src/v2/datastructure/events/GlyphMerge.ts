import {Glyph} from "../Glyph";
import {Type} from "./Type";
import {Event} from "./Event";
import {GrowFunction} from "../growfunction/GrowFunction";

export class GlyphMerge extends Event {
  // constructor(a: Glyph, b: Glyph)
  constructor(a: Glyph, b: Glyph, at?: number) {
    if (at === null || at === undefined) {
      at = GrowFunction.__intersectAtGlyphGlyph(a, b);
    }
    super(at, 2);
    this.glyphs[0] = a;
    this.glyphs[1] = b;
  }

  public getOther(glyph: Glyph): Glyph {
    if (this.glyphs[0] === glyph) {
      return this.glyphs[1];
    }
    return this.glyphs[0];
  }

  public getType() {
    return Type.MERGE;
  }

  // /**
  //  * Returns a new {@link UncertainGlyphMerge} instance built on this event.
  //  * @deprecated use new UncertainGlyphMerge
  //  */
  // public uncertain(): UncertainGlyphMerge {
  //   return new UncertainGlyphMerge(this);
  // }
}
