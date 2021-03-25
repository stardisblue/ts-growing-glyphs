import {Pattern} from "../java/Pattern";
import {Entry, HashMap} from "../java/HashMap";
import {Stat} from "./Stat";
import {Level, Logger} from "../java/Logger";
import {Comparator} from "./Comparator";
import {ArrayList} from "../java/ArrayList";
import {String__length} from "./Utils";

export class Stats {
  private static readonly TAG_REGEX: Pattern = Pattern.compile(
    /^\[([a-z]+)]\s+/
  );

  /**
   * Map of stat names to objects recording full stat information.
   */
  private static readonly stats: HashMap<string, Stat> = new HashMap();

  static count(name: string);
  static count(name: string, bool: boolean);
  static count(name: string, bool?: boolean) {
    if (bool !== undefined) {
      this.__countStringBoolean(name, bool);
    }
    this.__countString(name);
  }

  static __countString(name: string) {
    this.record("[count] " + name, 1);
  }

  static __countStringBoolean(name: string, bool: boolean) {
    this.record("[perc] " + name, bool ? 1 : 0);
  }

  static get(name: string): Stat {
    if (!this.stats.containsKey(name)) {
      this.stats.put(name, new Stat(0));
    }
    return this.stats.get(name);
  }

  static log(name: string, logger: Logger) {
    if (!this.stats.containsKey(name)) {
      return;
    }
    this.stats.get(name).log(logger, name);
  }

  static logAll(logger: Logger) {
    logger.log(Level.FINE, "");
    logger.log(Level.FINE, "STATS");
    const padTo = this.stats
      .keySet()
      .stream()
      .filter((n) => {
        const tagMatcher = this.TAG_REGEX.matcher(n);
        return !tagMatcher.find() || tagMatcher.group(1) !== "perc";
      })
      .map((n) => this.TAG_REGEX.matcher(n).replaceAll(""))
      .max(Comparator.comparingInt(String__length))
      .get().length;
    // const f = "%1$-" + padTo + "s";

    const f = (k: string) => k.padEnd(padTo);
    const toSort = new ArrayList<Entry<string, Stat>>();
    for (const e of this.stats.entrySet()) {
      toSort.add(e);
    }
    toSort.sort(Comparator.comparing(a => this.noTag(a.getKey())));
    for (const e of toSort) {
      const tagMatcher = this.TAG_REGEX.matcher(e.getKey());
      if (tagMatcher.find()) {
        const tag = tagMatcher.group(1);
        const n = f(tagMatcher.replaceAll(""));
        if (tag === "perc") {
          e.getValue().logPercentage(logger, n);
        } else {
          e.getValue().logCount(logger, n);
        }
      } else {
        e.getValue().log(logger, f(e.getKey()));
      }
    }
  }

  static record(name: string, value: number) {
    if (this.stats.containsKey(name)) {
      this.stats.get(name).record(value);
    } else {
      const stat = new Stat(value);
      this.stats.put(name, stat);
    }
  }

  static remove(name: string) {
    this.stats.remove(name);
  }

  static reset() {
    this.stats.clear();
  }

  /**
   * Given a stat name, return the name without tag.
   */
  private static noTag(name: string): string {
    const tagMatcher = this.TAG_REGEX.matcher(name);
    if (tagMatcher.find()) {
      return tagMatcher.replaceAll("").trim();
    }
    return name;
  }
}