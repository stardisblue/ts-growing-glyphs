import { Point2D } from "../java/Point2D";
import { Comparable } from "../java/Comparable";
export declare class LatLng implements Comparable<LatLng> {
    lat: any;
    lng: any;
    constructor(lat: number, lng: number);
    toString(): string;
    toPoint(zoom: number): Point2D;
    compareTo(o: LatLng): 1 | -1 | 0;
}
//# sourceMappingURL=LatLng.d.ts.map