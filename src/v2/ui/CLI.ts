import { Level, Logger } from '../java/Logger';
import { Constants } from '../utils/Constants';
import { System } from '../java/System';
import { PrintStream } from '../java/PrintStream';
import { ConfigurableConsoleHandler } from '../java/ConfigurableConsoleHandler';
import { QuadTree } from '../datastructure/QuadTree';
import { QuadTreeClusterer } from '../algorithm/clustering/QuadTreeClusterer';
import { Stats, Timers } from '../utils/Utils';
import { File } from '../java/File';
import { CsvIO } from '../io/CsvIO';
import { PointIO } from '../io/PointIO';

const LOGGER: Logger = Constants.LOGGING_ENABLED
  ? Logger.getLogger('QuadTreeClusterer')
  : null;

export class CLI {
  static async main(args: string[]) {
    if (args.length < 5) {
      System.err.println('usage: CLI [input] [algorithm] [stats]');
      return;
    }

    const [, , pInput, pAlgorithm, pStats] = args;

    Constants.STATS_ENABLED = pStats === 'y';
    if (!Constants.STATS_ENABLED && pStats !== 'n') {
      System.err.println("Stats argument must be eithe 'y' or 'n'.");
      return;
    }

    try {
      ConfigurableConsoleHandler.redirectTo(
        new PrintStream(new File('non_regression.txt'))
      );
    } catch (e) {
      System.err.println('Cannot open output file for writing');
      return;
    }

    const w = 512;
    const h = 512;

    const tree = new QuadTree(-w / 2, -h / 2, w, h);
    const clusterer = new QuadTreeClusterer(tree);

    // select correct algorithm

    // with the correct parameters
    Constants.BIG_GLYPHS = false;
    Constants.ROBUST = false;
    if (pAlgorithm === 'quad') {
      Constants.ROBUST = true;
    } else if (pAlgorithm === 'big') {
      Constants.BIG_GLYPHS = true;
    }

    // set correct grow function
    // open right input
    const file = new File(pInput);
    if (file.getName().endsWith('.csv') || file.getName().endsWith('.tsv')) {
      await CsvIO.read(file, tree);
    } else {
      await PointIO.read(file, tree);
    }

    Stats.reset();
    Timers.reset();

    // cluster!
    try {
      if (LOGGER !== null) {
        LOGGER.log(
          Level.FINE,
          'clustering using the QuadTree Clusterer algorithm'
        );
        LOGGER.log(
          Level.FINE,
          `${Constants.STATS_ENABLED ? '' : 'not '}collecting stats`
        );
        LOGGER.log(
          Level.FINE,
          `${Constants.ROBUST ? '' : 'not '}using QUAD+ optimization`
        );
        LOGGER.log(
          Level.FINE,
          `${Constants.BIG_GLYPHS ? '' : 'not '}using big glyph optimization`
        );
      }
      clusterer.cluster();
    } catch (e) {
      System.err.println('Timed out.');
    } finally {
      ConfigurableConsoleHandler.undoRedirect();
    }
  }
}
