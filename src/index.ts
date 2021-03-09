import {Constants} from './Constants';
import {CsvIO, GGFile, PointIO} from './GGFile';
import {Level, Logger} from './Logger';
import {QuadTree} from './QuadTree';
import {QuadTreeClusterer} from './QuadTreeClusterer';
import {Utils} from './Utils';

const LOGGER = Constants.LOGGING_ENABLED ? new Logger() : null;

/**
 *
 * @param argv [input] [algorithm] [stats <y,n>]
 */
async function main(argv: string[]) {
    console.log(argv);
    if (argv.length < 4) {
        console.log('usage: CLI [INPUT] [algorithm] [stats]');
        return;
    }

    const [, , pInput, pAlgorithm, pStats] = argv;

    // collect stats ?
    Constants.STATS_ENABLED = pStats === 'y';
    if (!Constants.STATS_ENABLED && pStats !== 'n') {
        console.error("Stats argument must be either 'y' or 'n'.");
        return;
    }

    Logger.redirectTo('non_regression.txt');

    const w = 512;
    const h = 512;

    const tree = new QuadTree(-w / 2, -h / 2, w, h);
    const clusterer = new QuadTreeClusterer(tree);

    Constants.BIG_GLYPHS = false;
    Constants.ROBUST = false;
    if (pAlgorithm === 'quad') {
        Constants.ROBUST = true;
    } else if (pAlgorithm === 'big') {
        Constants.BIG_GLYPHS = true;
    }

    const file = new GGFile(pInput);
    if (file.getName().endsWith('.csv') || file.getName().endsWith('.tsv')) {
        await CsvIO.read(file, tree);
    } else {
        await PointIO.read(file, tree);
    }

    Utils.Stats.reset();
    Utils.Timers.reset();

    if (LOGGER !== null) {
        LOGGER.log(Level.FINE, 'clustering using the QuadTree Clusterer algorithm');
        LOGGER.log(
            Level.FINE,
            `${Constants.STATS_ENABLED ? '' : 'not'}collecting stats`
        );
        LOGGER.log(
            Level.FINE,
            `${Constants.ROBUST ? '' : 'not'}using QUAD+ optimization`
        );
        LOGGER.log(
            Level.FINE,
            `${Constants.BIG_GLYPHS ? '' : 'not'}using big glyph optimization`
        );
    }
    clusterer.cluster();

    Logger.undoRedirect();
}

main(process.argv);
