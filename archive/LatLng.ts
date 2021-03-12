import {EPSG3857} from "./EPSG3857";
import {Point2D} from "./Point2D";

export class LatLng {
    lat: any;
    lng: any;

    constructor(lat: number, lng: number) {
        this.lat = lat;
        this.lng = lng;
    }

    toString(): string {
        return `LatLng[${this.lat},${this.lng}]`;
    }

    toPoint(zoom: number): Point2D {
        return EPSG3857.latLngToPoint(this, zoom);
    }
}
