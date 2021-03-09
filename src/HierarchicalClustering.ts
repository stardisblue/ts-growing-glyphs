import {Glyph} from "./Glyph";

export class HierarchicalClustering {
    private createdFrom: HierarchicalClustering[] | null;
    private glyph: Glyph;
    private at: number;

    constructor(glyph: Glyph, at: number, ...createdFrom: HierarchicalClustering[]) {
        this.glyph = glyph;
        this.at = at;
        if (createdFrom.length === 0) {
            this.createdFrom = null;
        } else {
            this.createdFrom = Array.from(createdFrom);
        }
    }
}
