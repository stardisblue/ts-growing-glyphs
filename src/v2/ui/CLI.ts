import {Logger} from "../java/Logger";
import {Constants} from "../utils/Constants";
import {System} from "../java/System";
import {PrintStream} from "../java/PrintStream";
import {ConfigurableConsoleHandler} from "../java/ConfigurableConsoleHandler";
import {QuadTree} from "../datastructure/QuadTree";
import {QuadTreeClusterer} from "../algorithm/clustering/QuadTreeClusterer";

const LOGGER: Logger = (Constants.LOGGING_ENABLED ? Logger.getLogger("QuadTreeClusterer") : null);


export class CLI {
    static main(args: string[]) {
        if (args.length < 3) {
            System.err.println("usage: CLI [input] [algorithm] [stats]");
            return;
        }

        const [pInput, pAlgorithm, pStats] = args;

        Constants.STATS_ENABLED = pStats === "y";
        if (!Constants.STATS_ENABLED && pStats !== "n") {
            System.err.println("Stats argument must be eithe 'y' or 'n'.");
            return;
        }


        try {
            ConfigurableConsoleHandler.redirectTo(new PrintStream("non_regression.txt"));
        } catch (e) {
            System.err.println("Cannot open output file for writing");
            return;
        }

        const w = 512;
        const h = 512;

        const tree = new QuadTree(-w / 2, -h / 2, w, h);
        const clusterer = new QuadTreeClusterer(tree)
    }
}


