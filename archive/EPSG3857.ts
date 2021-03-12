import {LatLng} from "./LatLng";
import {Point2D} from "./Point2D";

export class EPSG3857 {
    static R = 6378137;
    static MAX_LATITUDE = 85.0511287798;
    static TRANSFORM_SCALE: number = 0.5 / (Math.PI * EPSG3857.R);

    static project(latlng: LatLng) {
        const d = Math.PI / 180,
            max = this.MAX_LATITUDE,
            lat = Math.max(Math.min(max, latlng.lat), -max),
            sin = Math.sin(lat * d);

        return new Point2D(
            this.R * latlng.lng * d,
            (this.R * Math.log((1 + sin) / (1 - sin))) / 2
        );
    }

    static latLngToPoint(latLng: LatLng, zoom: number) {
        const projectedPoint = this.project(latLng);
        return this.transform(projectedPoint, this.scale(zoom));
    }

    static transform(p: Point2D, scale: number) {
        return new Point2D(
            scale * (this.TRANSFORM_SCALE * p.x + 0.5),
            scale * (-this.TRANSFORM_SCALE * p.y + 0.5)
        );
    }

    static scale(zoom: number): any {
        return 256 * Math.pow(2, zoom);
    }
}
