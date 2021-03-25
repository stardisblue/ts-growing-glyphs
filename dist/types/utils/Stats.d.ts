import { Stat } from "./Stat";
import { Logger } from "../java/Logger";
export declare class Stats {
    private static readonly TAG_REGEX;
    /**
     * Map of stat names to objects recording full stat information.
     */
    private static readonly stats;
    static count(name: string): any;
    static count(name: string, bool: boolean): any;
    static __countString(name: string): void;
    static __countStringBoolean(name: string, bool: boolean): void;
    static get(name: string): Stat;
    static log(name: string, logger: Logger): void;
    static logAll(logger: Logger): void;
    static record(name: string, value: number): void;
    static remove(name: string): void;
    static reset(): void;
    /**
     * Given a stat name, return the name without tag.
     */
    private static noTag;
}
//# sourceMappingURL=Stats.d.ts.map