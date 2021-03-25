import { File } from './File';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

export class Scanner {
  private file: File;
  private __it: AsyncIterableIterator<string>;
  private _cache: IteratorYieldResult<string>;
  precheck: boolean = false;

  constructor(file: File) {
    this.file = file;
    const rl = createInterface({
      input: createReadStream(file.name),
    });
    this.__it = rl[Symbol.asyncIterator]();
  }

  async hasNextLine() {
    if (this.precheck === false) {
      this.precheck = true;
      this._cache = (await this.__it.next()) as IteratorYieldResult<string>;
    }
    return this._cache === undefined || !this._cache.done;
  }

  async nextLine() {
    if (this.precheck) {
      this.precheck = false;
      return this._cache.value;
    }
    this._cache = (await this.__it.next()) as IteratorYieldResult<string>;
    return this._cache.value;
  }
}
