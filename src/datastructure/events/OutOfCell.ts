import { Event } from './Event';
import { QuadTree } from '../QuadTree';
import { Side } from './Side';
import { Glyph } from '../Glyph';
import { GrowFunction } from '../growfunction/GrowFunction';
import { Type } from './Type';

export class OutOfCell extends Event {
  private readonly cell: QuadTree;
  private readonly side: Side;

  constructor(glyph: Glyph, cell: QuadTree, side: Side, at?: number) {
    if (at === undefined) {
      at = GrowFunction.exitAt(glyph, cell, side);
    }
    super(at, 1);
    this.glyphs = [glyph];
    this.cell = cell;
    this.side = side;
  }

  /**
   * @deprecated use #cell
   */
  getCell() {
    return this.cell;
  }

  /**
   * return #side
   */
  getSide() {
    return this.side;
  }

  getType() {
    return Type.OUT_OF_CELL;
  }
}
