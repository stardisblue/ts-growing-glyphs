import { Glyph } from './Glyph';
interface Comparable<T> {
    compareTo(o: T): number;
}
export declare class HierarchicalClustering implements Comparable<HierarchicalClustering> {
    private glyph;
    private readonly at;
    private createdFrom;
    /**
     * Create a (node of a) hierarchical clustering that represents a glyph and
     * the glyphs it was created from. The clustering records at which point in
     * time/zooming the merge happened as well.
     *
     * @param glyph       Glyph that was created from a merge.
     * @param at          Time or zoom level at which the merge happened.
     * @param createdFrom One or more glyphs that were merged into {@code glyph}.
     *                    It is also possible to construct a hierarchical clustering of a
     *                    single glyph by omitting this parameter.
     */
    constructor(glyph: Glyph, at: number, ...createdFrom: HierarchicalClustering[]);
    alsoCreatedFrom(from: HierarchicalClustering): void;
    compareTo(that: HierarchicalClustering): number;
    /**
     * @deprecated use #at
     */
    getAt(): number;
    /**
     * @deprecated use #glyph
     */
    getGlyph(): Glyph;
    setGlyph(glyph: Glyph): void;
    toString(): any;
    toString(indent: string, showCreatedFrom: boolean, showCreatedFromRecursively: boolean, limit: number): any;
}
export {};
//# sourceMappingURL=HierarchicalClustering.d.ts.map