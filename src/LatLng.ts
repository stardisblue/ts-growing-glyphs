import { Point2D } from './Point2D';

export class LatLng {
  constructor(lat: number, lng: number) {
    throw new Error('to implement');
  }

  valueOf(): string {
    throw new Error('to implement');
  }

  toPoint(zoom: number): Point2D {
    throw new Error('Method not implemented.');
  }
}
