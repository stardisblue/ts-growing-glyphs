import {Constants} from './Constants';
import {Logger} from './Logger';
import {MultiQueue} from './MultiQueue';
import {OutOfCell} from './OutOfCell';
import {PriorityQueue} from './PriorityQueue';
import {QuadTree} from './QuadTree';

export class Glyph {
    track: boolean;
    trackedBy: any[] | null;
    x: number;
    y: number;
    n: number;
    alive: number;
    big: boolean;
    cells: any[];
    uncertainMergeEvents: null;
    adoptedBy: null;
    mergeEvents: any;
    outOfCellEvents: any;

    constructor(x: number, y: number, n: number, alive: boolean = false) {
        if (n < 1) throw new Error('n must be at least 1');

        this.track = false;
        if (Constants.TRACK && !Constants.ROBUST) {
            this.trackedBy = new Array();
        } else {
            this.trackedBy = null;
        }
        this.x = x;
        this.y = y;
        this.n = n;
        this.alive = alive ? 1 : 0;
        this.big = false;
        this.cells = new Array();
        this.uncertainMergeEvents = null;
        this.adoptedBy = null;
        this.mergeEvents = new PriorityQueue(Constants.MAX_MERGES_TO_RECORD);
        this.outOfCellEvents = new PriorityQueue();
    }

    record(arg0: OutOfCell) {
        throw new Error('Method not implemented.');
    }

    popOutOfCellInto(q: MultiQueue, LOGGER: Logger) {
        throw new Error('Method not implemented.');
    }

    isAlive(): unknown {
        return this.alive === 1;
    }

    /**
     * @deprecated
     * @see #n
     */
    getN() {
        throw new Error('Method not implemented.');
    }

    addCell(cell: QuadTree) {
        if (!this.cells.includes(cell)) {
            this.cells.push(cell);
        }
    }
}
