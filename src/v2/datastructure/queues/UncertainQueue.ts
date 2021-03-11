import {PriorityQueue} from "../../java/PriorityQueue";
import {UncertainGlyphMerge} from "../events/UncertainGlyphMerge";
import {Utils} from "../../utils/Utils";
import {GrowFunction} from "../growfunction/GrowFunction";
import {GlyphMerge} from "../events/GlyphMerge";

export class UncertainQueue extends PriorityQueue<UncertainGlyphMerge> {

    private α;

    constructor() {
        super();
        this.α = 1;
    }

    add(merge: UncertainGlyphMerge) {
        const t = merge.computeAt();
        merge.setLowerBound(t / this.α);
        return super.add(merge);
    }

    peek(): UncertainGlyphMerge {
        while (!this.isEmpty()) {
            const merge = super.peek();
            const wth = merge.getSmallGlyph();
            if (!wth.isAlive()) {
                super.poll();
                continue; // try the next event
            }

            // check if event is the first
            const t = merge.computeAt();
            const τ = merge.getLowerBound();
            if (Utils.Double.eq(t, this.α * τ)) {
                return merge;
            }

            // if not, update its key and reinsert
            super.poll();
            merge.setLowerBound(t / this.α);
            super.add(merge);
        }
        return null;
    }

    poll(): UncertainGlyphMerge {
        // ensure that the actual first event is the head of the queue
        if (this.peek() == null) {
            return null;
        }
        // return it if there is one
        return super.poll();
    }

    /**
     * Update α to maintain the invariant.
     *
     * @param event Event that caused need for updating α.
     */
    updateAlpha(event: GlyphMerge) {
        let bigRadius = GrowFunction.radius(event.getGlyphs()[0], event.getAt());
        let smallRadius = GrowFunction.radius(event.getGlyphs()[1], event.getAt());
        if (bigRadius < smallRadius) {
            const tmp = smallRadius;
            smallRadius = bigRadius;
            bigRadius = tmp;
        }

        this.α = (bigRadius - smallRadius) / (bigRadius + smallRadius) * this.α;
    }


}