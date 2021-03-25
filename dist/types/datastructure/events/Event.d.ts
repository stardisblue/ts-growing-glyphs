import { Glyph } from '../Glyph';
import { Type } from './Type';
import { Comparable } from "../../java/Comparable";
export declare abstract class Event implements Comparable<Event> {
    /**
     * Timestamp/zoom level at which the event occurs.
     */
    at: number;
    /**
     * Glyph(s) involved in the event.
     */
    glyphs: Glyph[];
    /**
     * Construct an event that occurs at the given timestamp/zoom level.
     */
    protected constructor(at: number, glyphCapacity: number);
    compareTo(that: Event): number;
    /**
     * Returns when the event occurs. This can be interpreted either as a
     * timestamp or as a zoom level.
     *
     * @deprecated use #at
     */
    getAt(): number;
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
     * Returns the {@link Type} of this {@link Event}.
     */
    abstract getType(): Type;
    toString(): string;
}
//# sourceMappingURL=Event.d.ts.map