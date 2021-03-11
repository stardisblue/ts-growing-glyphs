import {Constants} from "./Constants";
import {Level, Logger} from "./Logger";
import {QuadTree} from "./QuadTree";
import {Utils} from "./Utils";
import readline from "readline";
import {createReadStream, ReadStream} from "fs";
import {LatLng} from "./LatLng";
import {Glyph} from "./Glyph";

export class GGFile {
    path: string;
    private _stream: ReadStream | null;

    constructor(path: string) {
        this._stream = null;
        this.path = path;
    }

    getStream() {
        return this._stream ?? (this._stream = createReadStream(this.path));
    }

    getName(): string {
        return this.path;
    }
}

export class CsvIO {
    private static LOGGER = Constants.LOGGING_ENABLED ? new Logger() : null;

    static async read(file: GGFile, tree: QuadTree) {
        this.LOGGER?.log(Level.FINE, "ENTRY into CsvIO#read()");

        if (Constants.TIMERS_ENABLED) Utils.Timers.start("reading file");

        const ignoredRead = [0, 0];

        const rl = readline.createInterface(file.getStream());

        let titleCols: string[] = [];
        let latInd: number = 0;
        let lngInd: number = 0;
        let nInd: number = 0;
        let splitOn: string | RegExp = "\t";
        const read = new Map<string, { p: LatLng; weight: number }>();

        let titleLine = true;

        for await (const line of rl) {
            if (titleLine) {
                splitOn = line.indexOf("\t") > 0 ? "\t" : /\\s*,\\s*/;
                titleCols = line.split(splitOn);
                latInd = Utils.indexOf(titleCols, "latitude");
                lngInd = Utils.indexOf(titleCols, "longitude");
                nInd = Utils.indexOf(titleCols, "n");
                if (latInd < 0 || lngInd < 0)
                    throw new Error("need columns 'latitude' and 'longitude' in data");

                titleLine = false;
                continue;
            }

            const cols = line.split(splitOn);
            if (
                cols.length <= Math.max(latInd, lngInd) ||
                cols[latInd] === "NULL" ||
                cols[lngInd] === "NULL"
            ) {
                ignoredRead[0]++;
                continue;
            }

            const p = new LatLng(+cols[latInd], +cols[lngInd]);

            const weight = nInd >= 0 ? +cols[nInd] : 1;

            if (read.has(p.toString())) {
                read.set(p.toString(), {...read.get(p.toString())!, weight});
            } else {
                read.set(p.toString(), {p, weight});
            }

            ignoredRead[1]++;
        }

        for (const values of read.values()) {
            const p = values.p.toPoint(1);
            tree.insertCenterOf(new Glyph(p.x - 256, p.y - 256, values.weight, true));
        }

        this.LOGGER?.log(Level.INFO, `loaded ${read.size} locations`);

        if (Constants.TIMERS_ENABLED)
            Utils.Timers.log("reading file", CsvIO.LOGGER);
        if (Constants.LOGGING_ENABLED)
            this.LOGGER?.log(
                Level.INFO,
                `read ${ignoredRead[1]} entries and ignored ${ignoredRead[0]}`
            );
        if (Constants.LOGGING_ENABLED)
            this.LOGGER?.log(Level.FINE, "RETURN from Csv#read()");

        return ignoredRead[1];
    }
}

export class PointIO {
    static read(file: GGFile, tree: QuadTree) {
        throw new Error("To implement");
    }
}
