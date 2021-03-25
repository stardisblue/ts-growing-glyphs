import { LatLng } from './LatLng';
import { Point2D } from '../java/Point2D';
export declare class EPSG3857 {
    static R: number;
    static MAX_LATITUDE: number;
    static TRANSFORM_SCALE: number;
    static project(latlng: LatLng): Point2D;
    static latLngToPoint(latLng: LatLng, zoom: number): Point2D;
    static transform(p: Point2D, scale: number): Point2D;
    static scale(zoom: number): any;
}
//# sourceMappingURL=EPSG3857.d.ts.map