import {Point2D} from "../java/Point2D";
import {EPSG3857} from "./EPSG3857";
import {Comparable} from "../java/Comparable";

export class LatLng implements Comparable<LatLng> {
  lat: any;
  lng: any;

  constructor(lat: number, lng: number) {
    if (Number.isNaN(lat) || Number.isNaN(lng))
      throw new Error("bad coordinates");
    this.lat = lat;
    this.lng = lng;
  }

  toString(): string {
    return `LatLng[${this.lat},${this.lng}]`;
  }

  toPoint(zoom: number): Point2D {
    return EPSG3857.latLngToPoint(this, zoom);
  }

  compareTo(o: LatLng) {

    if (this.lat > o.lat) {
      return 1;
    } else if (this.lat == o.lat) {
      if (this.lng > o.lng) {
        return 1;
      } else if (this.lng === o.lng) {
        return 0;
      } else {
        return -1;
      }
    } else {
      return -1;
    }
  }
}
