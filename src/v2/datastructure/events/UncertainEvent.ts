import {Glyph} from "../Glyph";
import {Type} from "./Type";
import {StringBuilder} from "../../java/StringBuilder";

export abstract class UncertainEvent {


    /**
     * Timestamp/zoom level at which the event occurs at the earliest.
     */
    protected lb: number;

    /**
     * Glyph(s) involved in the event.
     */
    protected glyphs: Glyph[];

    protected constructor(lowerBound: number, glyphCapacity: number) {
        this.lb = lowerBound;
        this.glyphs = [];
    }

    public compareTo(that: UncertainEvent): number {
        const diff = Math.sign(this.lb - that.lb);
        if (diff != 0) {
            return diff;
        }
        return this.getType().priority - that.getType().priority;
    }

    /**
     * Returns when the event occurs at the earliest. This can be interpreted
     * either as a timestamp or as a zoom level.
     */
    public getLowerBound(): number {
        return this.lb;
    }

    /**
     * Returns the number of glyphs involved in this event.
     */
    public getSize(): number {
        return this.glyphs.length;
    }

    /**
     * Returns the glyph(s) involved in this event.
     * @deprecated use #glyphs
     */
    public getGlyphs() {
        return this.glyphs;
    }

    /**
     * Returns the {@link Type} of this {@link UncertainEvent}.
     */
    public abstract getType(): Type;

    public toString(): string {
        const sb = new StringBuilder("uncertain ");
        sb.append(this.getType().toString());
        sb.append(" at (lower bound) ");
        sb.append(this.lb);
        sb.append(" involving [");
        let first = true;
        for (const glyph of this.glyphs) {
            if (!first) {
                sb.append(", ");
            }
            if (glyph == null) {
                sb.append("null");
            } else {
                sb.append(glyph.toString());
            }
            first = false;
        }
        sb.append("]");
        return sb.toString();
    }
}