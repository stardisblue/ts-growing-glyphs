import { PriorityQueue } from '../../java/PriorityQueue';
import { UncertainGlyphMerge } from '../events/UncertainGlyphMerge';
import { GlyphMerge } from '../events/GlyphMerge';
export declare class UncertainQueue extends PriorityQueue<UncertainGlyphMerge> {
    private α;
    constructor();
    add(merge: UncertainGlyphMerge): boolean;
    peek(): UncertainGlyphMerge;
    poll(): UncertainGlyphMerge;
    /**
     * Update α to maintain the invariant.
     *
     * @param event Event that caused need for updating α.
     */
    updateAlpha(event: GlyphMerge): void;
}
//# sourceMappingURL=UncertainQueue.d.ts.map