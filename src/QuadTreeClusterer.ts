import {Stats, Timers, Utils} from './Utils';
import {Constants} from './Constants';
import {Level, Logger} from './Logger';
import {QuadTree} from './QuadTree';
import {Glyph} from './Glyph';
import {MultiQueue} from './MultiQueue';
import {HierarchicalClustering} from './HierarchicalClustering';
import {FirstMergeRecorder} from './FirstMergeRecorder';
import {OutOfCell, Side} from './OutOfCell';
import {Stat} from './Stat';

const LOGGER = Constants.LOGGING_ENABLED ? new Logger() : null;

export class QuadTreeClusterer {
    static GlobalState = class GlobalState {
        map: Map<Glyph, HierarchicalClustering>;
        numAlive = 0;
        glyphSize = new Stat();

        constructor(map: Map<Glyph, HierarchicalClustering>) {
            this.map = map;
        }
    };
    tree: QuadTree;
    result: null;
    rec: FirstMergeRecorder | null;

    constructor(tree: QuadTree) {
        this.tree = tree;
        this.result = null;
        this.rec = null;
    }

    cluster() {
        const defaultLevel = LOGGER === null ? null : LOGGER.getLevel();

        if (LOGGER !== null) {
            LOGGER.log(Level.FINER, 'ENTRY into AgglomerativeClustering#cluster()');
            LOGGER.log(
                Level.FINE,
                `clustring using ${[
                    Constants.ROBUST ? 'ROBUST' : '',
                    Constants.TRACK && !Constants.ROBUST ? 'TRACK' : '',
                    !Constants.ROBUST && !Constants.TRACK ? 'FIRSTT MERGE ONLY' : '',
                    'NO BUCKETING',
                ].join(' + ')} strategy`
            );
            LOGGER.log(
                Level.FINE,
                'using the Linear Area Growing Circles grow function'
            );
            LOGGER.log(
                Level.FINE,
                `QuadTree has ${this.tree.getSize()} nodes and height ${this.tree.getTreeHeight()}, having at most ${
                    Constants.MAX_GLYPHS_PER_CELL
                } glyphs per cell and cell size at least ${Constants.MIN_CELL_SIZE}`
            );
            if (LOGGER.isLoggable(Level.FINE)) {
                let n = 0;
                for (const leaf of this.tree.getLeaves()) {
                    Stats.record('glyphs per cell', leaf.getGlyphs().length);
                    for (const glyph of leaf.getGlyphs()) {
                        n += glyph.n;
                    }
                }
                Stats.record('total # works', n);
            }
        }
        if (Constants.TIMERS_ENABLED) Timers.start('clustering');

        // construct a queue, put everything in there - 10x number of glyphs
        // appears to be a good estimate for needed capacity without bucketing
        const q = new MultiQueue(10 * this.tree.iteratorGlyphsAlive().length);
        // also create a result for each glyph, and a map to find them
        const map = new Map<Glyph, HierarchicalClustering>();
        // then create a single object that is used to find first merges
        this.rec = FirstMergeRecorder.getInstance();
        // group temporary and shared variables together in one object to reduce
        // the number of parameters to #handleGlyphMerge
        const state = new GlobalState(map);

        // start recording merge events
        const rect = this.tree.getRectangle();

        for (const leaf of this.tree.getLeaves()) {
            const glyphs = leaf.getGlyphs().map((v) => v);
            for (let i = 0; i < glyphs.length; ++i) {
                // add events for when two glyphs in the same cell touch

                if (LOGGER !== null) LOGGER.log(Level.FINEST, glyphs[i].toString());
                this.rec.from(glyphs[i]);
                if (Constants.TIMERS_ENABLED) Timers.start('first merge recording 1');
                this.rec.record(glyphs, i + 1, glyphs.length);
                if (Constants.TIMERS_ENABLED) Timers.stop('first merge recording 1');
                this.rec.addEventsTo(q, LOGGER);

                // add events for when a glyph grows out of its cell
                for (const side of Side.values()) {
                    // only create an event when it is not a border of the root
                    if (!Utils.onBorderOf(leaf.getSide(side), rect)) {
                        // now, actually create an OUT_OF_CELL event
                        glyphs[i].record(new OutOfCell(glyphs[i], leaf, side));
                    }
                }
                glyphs[i].popOutOfCellInto(q, LOGGER);

                map.set(glyphs[i], new HierarchicalClustering(glyphs[i], 0));
                state.numAlive++;
                state.glyphSize.record(glyphs[i].n);
                if (!glyphs[i].isAlive()) {
                    if (LOGGER !== null) {
                        LOGGER.log(Level.SEVERE, 'unexpected dead glyph in input');
                    }
                    return null;
                }
                // create clustering leaves for all glyphs, count them as alive
            }
        }
        throw new Error('To implement');
    }
}

export const GlobalState = QuadTreeClusterer.GlobalState;
