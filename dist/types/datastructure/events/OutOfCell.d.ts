import { Event } from './Event';
import { QuadTree } from '../QuadTree';
import { Side } from './Side';
import { Glyph } from '../Glyph';
import { Type } from './Type';
export declare class OutOfCell extends Event {
    private readonly cell;
    private readonly side;
    constructor(glyph: Glyph, cell: QuadTree, side: Side, at?: number);
    /**
     * @deprecated use #cell
     */
    getCell(): QuadTree;
    /**
     * return #side
     */
    getSide(): Side;
    getType(): Type;
}
//# sourceMappingURL=OutOfCell.d.ts.map