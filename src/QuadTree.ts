import { Constants } from './Constants';
import { Glyph } from './Glyph';
import { Side } from './OutOfCell';
import { Rectangle2D } from './Rectangle2D';

export class QuadTree {
  insertCenterOf(arg0: Glyph) {
    throw new Error('Method not implemented.');
  }
  cell: Rectangle2D;
  parent: null;
  isOrphan: boolean;
  children: null;
  glyphs: any[];
  neighbors: any[];
  constructor(x: number, y: number, w: number, h: number) {
    this.cell = new Rectangle2D(x, y, w, h);
    this.parent = null;
    this.isOrphan = false;
    this.children = null;
    this.glyphs = new Array(Constants.MAX_GLYPHS_PER_CELL);
    this.neighbors = new Array(Side.values().length);
    for (const _ of Side.values()) {
      this.neighbors.push(new Array());
    }
  }
}
