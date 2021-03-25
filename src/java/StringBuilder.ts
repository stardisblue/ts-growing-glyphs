export class StringBuilder {
  private __internal: string;

  constructor(str?: string) {
    this.__internal = str ?? '';
  }

  append(s: number | string) {
    this.__internal += s;
    return this;
  }

  toString(): string {
    return this.__internal;
  }

  length() {
    return this.__internal.length;
  }
}
