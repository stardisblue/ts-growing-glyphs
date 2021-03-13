import { Point2D } from '../java/Point2D';
import { EPSG3857 } from './EPSG3857';

export class LatLng {
  lat: any;
  lng: any;

  constructor(lat: number, lng: number) {
    if (Number.isNaN(lat) || Number.isNaN(lng))
      throw new Error('bad coordinates');
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
