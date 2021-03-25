import { Glyph } from '../Glyph';
import { Type } from './Type';
export declare abstract class UncertainEvent {
    /**
     * Timestamp/zoom level at which the event occurs at the earliest.
     */
    protected lb: number;
    /**
     * Glyph(s) involved in the event.
     */
    protected glyphs: Glyph[];
    protected constructor(lowerBound: number, glyphCapacity: number);
    compareTo(that: UncertainEvent): number;
    /**
     * Returns when the event occurs at the earliest. This can be interpreted
     * either as a timestamp or as a zoom level.
     */
    getLowerBound(): number;
    /**
     * Returns the number of glyphs involved in this event.
     */
    getSize(): number;
    /**
     * Returns the glyph(s) involved in this event.
     * @deprecated use #glyphs
     */
    getGlyphs(): Glyph[];
    /**
     * Returns the {@link Type} of this {@link UncertainEvent}.
     */
    abstract getType(): Type;
    toString(): string;
}
//# sourceMappingURL=UncertainEvent.d.ts.map