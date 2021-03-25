import type { Glyph } from '../Glyph';
import { UncertainEvent } from './UncertainEvent';
import { GlyphMerge } from './GlyphMerge';
import { GrowFunction } from '../growfunction/GrowFunction';
import { Utils } from '../../utils/Utils';
import { Type } from './Type';
import { StringBuilder } from '../../java/StringBuilder';

export class UncertainGlyphMerge extends UncertainEvent {
  /**
   * Original event that the uncertain variant was constructed from.
   */
  protected from: GlyphMerge;

  /**
   * Computed (and updated) actual timestamp/zoom level of merge event.
   */
  protected at: number;

  constructor(m: GlyphMerge) {
    super(m.at, m.glyphs.length);
    this.glyphs = Array.from(m.glyphs);
    this.from = m;
    this.at = m.at;
  }

  /**
   * Recompute when this event will happen, but only if the big glyph changed.
   * Otherwise, a cached result is returned immediately.
   */
  computeAt(): number {
    // check if the cached answer still holds
    let changed = false;
    for (let i = 0; i < this.glyphs.length; ++i) {
      if (this.glyphs[i].isBig()) {
        const prev = this.glyphs[i];
        this.glyphs[i] = this.glyphs[i].getAdoptivePrimalParent();
        if (this.glyphs[i] != prev) {
          changed = true;
          this.from.glyphs[i] = this.glyphs[i];
        }
      }
    }
    // recompute, but only if needed
    if (changed) {
      this.at = GrowFunction.__intersectAtGlyphGlyph(this.glyphs[0], this.glyphs[1]);
    }
    return this.at;
  }

  /**
   * @deprecated use #at in js
   */
  getAt() {
    return this.at;
  }

  getGlyphMerge(): GlyphMerge {
    if (Utils.Double.neq(this.from.at, this.at)) {
      this.from = new GlyphMerge(
        this.from.glyphs[0],
        this.from.glyphs[1],
        this.at
      );
    }
    return this.from;
  }

  getSmallGlyph(): Glyph {
    if (this.glyphs[0].isBig()) {
      return this.glyphs[1];
    }
    return this.glyphs[0];
  }

  getType(): Type {
    return Type.MERGE;
  }

  /**
   * Update the lower bound of this event.
   *
   * @param lowerBound New lower bound.
   */
  setLowerBound(lowerBound: number) {
    this.lb = lowerBound;
  }

  toString() {
    const sb = new StringBuilder('uncertain ');
    sb.append(this.getType().toString());
    sb.append(' at ');
    sb.append(this.at);
    sb.append(', lower bound ');
    sb.append(this.lb);
    sb.append(' involving [');
    let first = true;
    for (const glyph of this.glyphs) {
      if (!first) {
        sb.append(', ');
      }
      if (glyph == null) {
        sb.append('null');
      } else {
        sb.append(glyph.toString());
      }
      first = false;
    }
    sb.append(']');
    return sb.toString();
  }
}
