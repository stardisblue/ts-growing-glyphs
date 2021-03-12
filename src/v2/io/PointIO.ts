import { Level, Logger } from '../java/Logger';
import { Constants } from '../utils/Constants';
import { QuadTree } from '../datastructure/QuadTree';
import { File, FileOutputStream } from '../java/File';
import { Timers } from '../utils/Utils';
import { Scanner } from '../java/Scanner';
import { Glyph } from '../datastructure/Glyph';
import { PrintStream } from '../java/PrintStream';

export class PointIO {
  private static readonly LOGGER: Logger = Constants.LOGGING_ENABLED
    ? Logger.getLogger(PointIO.name)
    : null;

  public static async read(file: File, tree: QuadTree) {
    PointIO.LOGGER.log(Level.FINE, 'ENTRY into PointIO#read()');
    let sum = 0;
    // Locales.push(Locale.US);
    if (Constants.TIMERS_ENABLED) {
      Timers.start('reading file');
    }
    try {
      const reader = new Scanner(file);
      while (reader.hasNextLine()) {
        const [x, y, n] = (await reader.nextLine()).split(' ').map(parseFloat);
        // while (reader.hasNextDouble()) {
        //     const x = reader.nextDouble();
        //     const y = reader.nextDouble();
        //     const n = reader.nextInt(10);
        const glyph = new Glyph(x, y, n, true);
        tree.insertCenterOf(glyph);
        sum += n;
      }
    } catch (e) {
      console.error(e);
      // e.printStackTrace();
    }
    if (Constants.TIMERS_ENABLED) {
      Timers.log('reading file', PointIO.LOGGER, Level.INFO);
    }
    // Locales.pop();
    PointIO.LOGGER.log(Level.FINE, 'RETURN from PointIO#read()');
    return sum;
  }

  public static write(tree: QuadTree, file: File) {
    // Locales.push(Locale.US);
    try {
      const writer = new PrintStream(new FileOutputStream(file));
      for (const leaf of tree.getLeaves()) {
        for (const s of leaf.getGlyphs()) {
          writer.println(s.getX() + ' ' + s.getY() + ' ' + s.getN());
        }
      }
    } catch (e) {
      e.printStackTrace();
    }
    // Locales.pop();
  }
}
