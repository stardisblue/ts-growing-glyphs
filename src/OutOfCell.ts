import {Event} from './Event';
import {Rectangle2D} from './Rectangle2D';

export class OutOfCell extends Event {
    static Side = class Side {
        static TOP = new Side(0, 1, 0);
        static RIGHT = new Side(1, 3, 1);
        static BOTTOM = new Side(2, 3, 2);
        static LEFT = new Side(0, 2, 3);
        private static _VALUES = [Side.TOP, Side.RIGHT, Side.BOTTOM, Side.LEFT];
        others: null;
        quadrants: number[];
        private _ordinal: number;

        constructor(quadrant1: number, quadrant2: number, ordinal: number) {
            this.others = null;
            this.quadrants = [quadrant1, quadrant2];
            this._ordinal = ordinal;
        }

        static quadrantNeighbor(index: number, side: Side) {
            switch (index) {
                // top left quadrant
                case 0:
                    return side.ordinal();
                // top right quadrant
                case 1:
                    return (index + side.ordinal()) % 4;
                // bottom left quadrant
                case 2:
                    return side === Side.TOP ? 0 : 3;
                // bottom right quadrant
                case 3:
                    return side === Side.TOP ? 1 : 2;
                default:
                    // to make compiler happy
                    return -1;
            }
        }

        /**
         * Given a rectangle and a side, return an interval capturing the given
         * side of the rectangle. For example, the TOP side of a rectangle is
         * characterized by its minimum and maximum X-coordinates.
         *
         * @param rect Rectangle to consider.
         * @param side Side to take of {@code rect}.
         */
        static interval(rect: Rectangle2D, side: Side): [number, number] {
            if (side === Side.TOP || side === Side.BOTTOM) {
                return [rect.getMinX(), rect.getMaxX()];
            }

            return [rect.getMinY(), rect.getMaxY()];
        }

        static quadrant(cell: Rectangle2D, x: number, y: number): number {
            return (y < cell.getCenterY() ? 0 : 2) + (x < cell.getCenterX() ? 0 : 1);
        }

        static values() {
            return this._VALUES;
        }

        opposite() {
            return Side.values()[(this.ordinal() + 2) % 4];
        }

        ordinal() {
            return this._ordinal;
        }
    };

    constructor() {
        super();
        throw new Error('To implement');
    }
}

export const Side = OutOfCell.Side;
