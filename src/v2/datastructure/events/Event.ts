import { Glyph } from '../Glyph';
import { Type } from './Type';
import { StringBuilder } from '../../java/StringBuilder';
import {Comparable} from "../../java/Comparable";

export abstract class Event implements Comparable<Event>{
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
  protected constructor(at: number, glyphCapacity: number) {
    this.at = at;
    this.glyphs = [];
  }

  compareTo(that: Event) {
    const diff = Math.sign(this.at - that.at);
    if (diff != 0) {
      return diff;
    }
    return this.getType().priority - that.getType().priority;
  }

  /**
   * Returns when the event occurs. This can be interpreted either as a
   * timestamp or as a zoom level.
   *
   * @deprecated use #at
   */
  getAt() {
    return this.at;
  }

  /**
   * Returns the number of glyphs involved in this event.
   */
  getSize() {
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
   * Returns the {@link Type} of this {@link Event}.
   */
  public abstract getType(): Type;

  toString() {
    const sb = new StringBuilder(this.getType().toString());
    sb.append(' at ');
    sb.append(this.at);
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
