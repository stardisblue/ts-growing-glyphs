import {Constants} from './Constants';
import {Glyph} from './Glyph';
import {Side} from './OutOfCell';
import {Rectangle2D} from './Rectangle2D';
import {Stats, Timers, Utils} from './Utils';

export class QuadTree {
    cell: Rectangle2D;
    parent: QuadTree | null;
    isOrphan: boolean;
    children: QuadTree[] | null;
    glyphs: Glyph[];
    neighbors: QuadTree[][];

    constructor(x: number, y: number, w: number, h: number) {
        this.cell = new Rectangle2D(x, y, w, h);
        this.parent = null;
        this.isOrphan = false;
        this.children = null;
        this.glyphs = new Array();
        this.neighbors = Side.values().map(() => new Array());
    }

    getSide(side: Side): any {
        throw new Error('Method not implemented.');
    }

    getRectangle() {
        return this.cell;
    }

    iteratorGlyphsAlive(): Glyph[] {
        return this.getLeaves().flatMap((cell) => cell.getGlyphsAlive());
    }

    getGlyphsAlive(): Glyph[] | null {
        if (this.glyphs === null) {
            return this.glyphs;
        }
        return this.glyphs.filter((g) => g.isAlive());
    }

    getGlyphs() {
        return this.glyphs;
    }

    getLeaves() {
        Timers.start('[QuadTree] getLeaves');
        const leaves: QuadTree[] = new Array();
        const considering: QuadTree[] = new Array();
        considering.push(this);
        while (considering.length !== 0) {
            const cell = considering.shift();
            if (cell.isLeaf()) {
                leaves.push(cell);
            } else {
                considering.push(...cell.children);
            }
        }
        Timers.stop('[QuadTree] getLeaves');
        return leaves;
    }

    getTreeHeight() {
        if (this.isLeaf()) {
            return 0;
        }
        let height = 1;

        for (const child of this.children) {
            const childHeight = child.getTreeHeight();
            height = Math.max(height, childHeight + 1);
        }
        return height;
    }

    getSize() {
        if (this.isLeaf()) {
            return 1;
        }

        let size = 1;

        for (const child of this.children) {
            size += child.getSize();
        }
        return size;
    }

    /**
     * Insert a given glyph into this QuadTree, but treat it as only its center
     * and handle the insertion as a regular QuadTree insertion. This means that
     * a split may be triggered by this insertion, in order to maintain the
     * maximum capacity of cells.
     *
     * @param glyph The glyph center to insert.
     * @return Whether center has been inserted.
     */
    insertCenterOf(glyph: Glyph) {
        Stats.count('QuadTree insertCenterOf');
        if (
            glyph.x < this.cell.getMinX() ||
            glyph.x > this.cell.getMaxX() ||
            glyph.y < this.cell.getMinY() ||
            glyph.y > this.cell.getMaxY()
        ) {
            Stats.count('QuadTree insertCenterOf', false);
            return false;
        }
        Stats.count('QuadTree insertCenterOf', true);
        // can we insert here?
        Timers.start('[QuadTree] insert');
        if (this.isLeaf() && this.glyphs.length < Constants.MAX_GLYPHS_PER_CELL) {
            if (!this.glyphs.includes(glyph)) {
                this.glyphs.push(glyph);
                glyph.addCell(this);
            }
            return true;
        }

        if (this.isLeaf()) {
            this.split();
        }

        this.children[Side.quadrant(this.cell, glyph.x, glyph.y)].insertCenterOf(
            glyph
        );
        Timers.stop('[QuadTree] insert');
        return true;
    }

    split() {
        Timers.start('[QuadTree] split');
        this.splitCell();
        // possibly distribute glyphs
        if (this.glyphs.length !== 0) {
            for (const glyph of this.glyphs) {
                this.children[
                    Side.quadrant(this.cell, glyph.x, glyph.y)
                    ].insertCenterOf(glyph);
            }
            // only maintain glyphs in leaves
            this.glyphs = null;
        }
        // notify listeners
        Timers.stop('[QuadTree] split');
    }

    splitCell() {
        if (!this.isLeaf())
            throw new Error('cannot split cell that is already split');

        Stats.count('QuadTree split cell');
        this.children = new Array(4);
        const x = this.getX();
        const y = this.getY();
        const w = this.getWidth();
        const h = this.getHeight();

        if (w / 2 < Constants.MIN_CELL_SIZE || h / 2 < Constants.MIN_CELL_SIZE)
            throw new Error('cannot split a tiny cell');

        for (let i = 0; i < 4; ++i) {
            this.children[i] = new QuadTree(
                x + (i % 2 === 0 ? 0 : w / 2),
                y + (i < 2 ? 0 : h / 2),
                w / 2,
                h / 2
            );
            this.children[i].parent = this;
        }

        // update neighbors of neighbors; we split now
        for (const side of Side.values()) {
            for (const neighbor of this.neighbors[side.ordinal()]) {
                const neighborsOnOurSide =
                    neighbor.neighbors[side.opposite().ordinal()];
                const idx = neighborsOnOurSide.indexOf(this);
                if (idx >= 0) neighborsOnOurSide.splice(idx, 1);

                for (const quadrant of side.quadrants) {
                    // only add as neighbors when they actualy neighbor our
                    // newly created children
                    if (
                        Utils.openIntervalsOverlap(
                            Side.interval(this.children[quadrant].cell, side),
                            Side.interval(neighbor.cell, side)
                        )
                    ) {
                        neighborsOnOurSide.push(this.children[quadrant]);
                    }
                }
            }
        }

        // update neighbors
        for (const side of Side.values()) {
            const neighborsOnSide = this.neighbors[side.ordinal()];

            for (const quadrant of side.quadrants) {
                const qi = Side.interval(this.children[quadrant].cell, side);
                // distribute own neighbors over children
                this.children[quadrant].neighbors[side.ordinal()].push(
                    // ensure that the neighbor is "in range" of the child
                    // cell; technically, we would need to consider the
                    // side.opposite() of the neighbor, but since it reduces
                    // to a 1D comparison with the exact same interval, we
                    // save ourselves some calculation and do it like this
                    ...neighborsOnSide.filter((neighbor) =>
                        Utils.openIntervalsOverlap(qi, Side.interval(neighbor.cell, side))
                    )
                );
                // the children are neighbors of each other; record this
                this.children[quadrant].neighbors[side.opposite().ordinal()].push(
                    this.children[Side.quadrantNeighbor(quadrant, side.opposite())]
                );
            }
            //replaces neighborsOnSide.clear();
            this.neighbors[side.ordinal()] = [];
        }
    }

    getY() {
        return this.cell.y;
    }

    getWidth() {
        return this.cell.width;
    }

    getHeight() {
        return this.cell.height;
    }

    getX() {
        return this.cell.x;
    }

    isLeaf(): boolean {
        return this.children === null;
    }
}
