import {Level, Logger} from "../java/Logger";
import {Constants} from "../utils/Constants";
import {File} from "../java/File";
import {QuadTree} from "../datastructure/QuadTree";
import {Timers, Utils} from "../utils/Utils";
import {HashMap} from "../java/HashMap";
import {Glyph} from "../datastructure/Glyph";
import {Scanner} from "../java/Scanner";
import {LatLng} from "../datastructure/LatLng";
import {ArrayList} from "../java/ArrayList";

export class CsvIO {
  private static readonly LOGGER: Logger = Constants.LOGGING_ENABLED
    ? Logger.getLogger(CsvIO.name)
    : null;

  public static async read(file: File, tree: QuadTree) {
    if (Constants.LOGGING_ENABLED) {
      CsvIO.LOGGER.log(Level.FINE, "ENTRY into CsvIO#read()");
    }
    if (Constants.TIMERS_ENABLED) {
      Timers.start("reading file");
    }

    const ignoredRead = [0, 0];

    try {
      let reader = new Scanner(file);
      if (!(await reader.hasNextLine())) {
        return -1;
      }
      const titleLine = await reader.nextLine();
      const splitOn = titleLine.indexOf("\t") > 0 ? "\t" : "\\s*,\\s*";
      const titleCols = titleLine.split(splitOn);
      const latInd = Utils.indexOf(titleCols, "latitude");
      const lngInd = Utils.indexOf(titleCols, "longitude");
      const nInd = Utils.indexOf(titleCols, "n");
      if (latInd < 0 || lngInd < 0) {
        throw new Error("need columns 'latitude' and 'longitude' in data");
      }
      // read data
      const read = new HashMap<string, [LatLng, number]>();
      while (await reader.hasNextLine()) {
        const line = await reader.nextLine();
        const cols = line.split(splitOn);
        // skip missing and null coordinates
        if (
          cols.length <= Math.max(latInd, lngInd) ||
          cols[latInd].trim() === "" ||
          cols[lngInd].trim() === ""
        ) {
          ignoredRead[0]++;
          continue;
        }
        // parse coordinates
        try {
          const p = new LatLng(
            Number.parseFloat(cols[latInd]),
            Number.parseFloat(cols[lngInd])
          );
          // increment count for that coordinate
          let weight = 1;
          if (nInd >= 0) {
            weight = Number.parseInt(cols[nInd]);
          }
          if (read.containsKey(p.toString())) {
            read.put(p.toString(), [p, read.get(p.toString())[1] + weight]);
          } else {
            read.put(p.toString(), [p, weight]);
          }
          ignoredRead[1]++;
        } catch (nfe) {
          ignoredRead[0]++;
          continue;
        }
      }
      // insert data into tree
      const latlngs = ArrayList.__new([...read.values()]).sort(([a], [b]) => a.compareTo(b));
      // insert data into tree
      for (const [ll, weight] of latlngs) {
        // QuadTree is built on zoom level 1, but centered around [0, 0]
        const p = ll.toPoint(1);
        tree.insertCenterOf(
          new Glyph(p.getX() - 256, p.getY() - 256, weight, true)
        );
      }
      if (Constants.LOGGING_ENABLED) {
        CsvIO.LOGGER.log(Level.INFO, `loaded ${read.size} locations`);
      }
    } catch (e) {
      console.error(e);
    }
    if (Constants.TIMERS_ENABLED) {
      Timers.log("reading file", CsvIO.LOGGER);
    }
    if (Constants.LOGGING_ENABLED) {
      CsvIO.LOGGER.log(
        Level.INFO,
        `read ${ignoredRead[1]} entries and ignored ${ignoredRead[0]}`
      );
    }
    if (Constants.LOGGING_ENABLED)
      CsvIO.LOGGER.log(Level.FINE, "RETURN from CsvIO#read()");
    return ignoredRead[1];
  }
}
