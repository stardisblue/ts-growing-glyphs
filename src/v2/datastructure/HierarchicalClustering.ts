import { Glyph } from './Glyph';
import { ArrayList } from '../java/ArrayList';
import { StringBuilder } from '../java/StringBuilder';

interface Comparable<T> {
  compareTo(o: T): number;
}

export class HierarchicalClustering
  implements Comparable<HierarchicalClustering> {
  private glyph: Glyph;
  private readonly at: number;
  private createdFrom: ArrayList<HierarchicalClustering>;

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
  constructor(
    glyph: Glyph,
    at: number,
    ...createdFrom: HierarchicalClustering[]
  ) {
    this.glyph = glyph;
    this.at = at;
    if (createdFrom.length === 0) {
      this.createdFrom = null;
    } else {
      this.createdFrom = ArrayList.__new(Array.from(createdFrom));
      // this.createdFrom = new ArrayList<HierarchicalClustering>(createdFrom)
    }
  }

  alsoCreatedFrom(from: HierarchicalClustering): void {
    if (this.createdFrom == null) {
      this.createdFrom = new ArrayList(2);
    }
    if (!this.createdFrom.contains(from)) {
      this.createdFrom.add(from);
    }
  }

  public compareTo(that: HierarchicalClustering): number {
    return Math.sign(this.at - that.at);
  }

  /**
   * @deprecated use #at
   */
  getAt() {
    return this.at;
  }

  /**
   * @deprecated use #glyph
   */
  getGlyph() {
    return this.glyph;
  }

  setGlyph(glyph: Glyph) {
    this.glyph = glyph;
  }

  toString();
  toString(
    indent: string,
    showCreatedFrom: boolean,
    showCreatedFromRecursively: boolean,
    limit: number
  );
  toString(
    indent: string = '',
    showCreatedFrom: boolean = true,
    showCreatedFromRecursively: boolean = true,
    limit: number = -1
  ) {
    let moreIndent = indent + '  ';

    let sb = new StringBuilder(indent);
    sb.append(HierarchicalClustering.name);
    sb.append('[\n');
    sb.append(moreIndent);
    sb.append(this.glyph.toString());
    sb.append(' at ');
    sb.append(this.at);
    if (this.createdFrom == null) {
      sb.append('\n');
    } else {
      sb.append(`from (${this.createdFrom.size()})\n`);
      // sb.append(String.format(" from (%d)\n", createdFrom.size()));
      if (showCreatedFrom) {
        this.createdFrom.sort((hc1, hc2) => {
          const d = Math.sign(hc2.getAt() - hc1.getAt());
          if (d === 0) {
            return hc2.getGlyph().getN() - hc1.getGlyph().getN();
          }
          return d;
        });
        let i = 0;
        for (const hc of this.createdFrom) {
          sb.append(
            hc.toString(
              moreIndent,
              showCreatedFromRecursively,
              showCreatedFromRecursively,
              limit
            )
          );
          if (++i == limit) break;
        }
        if (i < this.createdFrom.size()) {
          sb.append(moreIndent);
          sb.append('... (')
            .append(this.createdFrom.size() - i)
            .append(' more)\n');
        }
      }
    }
    sb.append(indent);
    sb.append(']\n');
    return sb.toString();
  }
}
