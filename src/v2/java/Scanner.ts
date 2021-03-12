import { File } from './File';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';

export class Scanner {
  private file: File;
  private __it: AsyncIterableIterator<string>;
  private _cache: IteratorYieldResult<string>;

  constructor(file: File) {
    this.file = file;
    const rl = createInterface({
      input: createReadStream(file.name),
      output: process.stdout,
    });
    this.__it = rl[Symbol.asyncIterator]();
  }

  hasNextLine() {
    return this._cache !== null && !this._cache.done;
  }

  async nextLine() {
    if (this.hasNextLine()) {
      return null;
    }
    this._cache = (await this.__it.next()) as IteratorYieldResult<string>;
    return this._cache.value;
  }
}
