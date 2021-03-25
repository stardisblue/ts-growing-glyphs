import type { Glyph } from '../Glyph';
import { UncertainEvent } from './UncertainEvent';
import { GlyphMerge } from './GlyphMerge';
import { Type } from './Type';
export declare class UncertainGlyphMerge extends UncertainEvent {
    /**
     * Original event that the uncertain variant was constructed from.
     */
    protected from: GlyphMerge;
    /**
     * Computed (and updated) actual timestamp/zoom level of merge event.
     */
    protected at: number;
    constructor(m: GlyphMerge);
    /**
     * Recompute when this event will happen, but only if the big glyph changed.
     * Otherwise, a cached result is returned immediately.
     */
    computeAt(): number;
    /**
     * @deprecated use #at in js
     */
    getAt(): number;
    getGlyphMerge(): GlyphMerge;
    getSmallGlyph(): Glyph;
    getType(): Type;
    /**
     * Update the lower bound of this event.
     *
     * @param lowerBound New lower bound.
     */
    setLowerBound(lowerBound: number): void;
    toString(): string;
}
//# sourceMappingURL=UncertainGlyphMerge.d.ts.map