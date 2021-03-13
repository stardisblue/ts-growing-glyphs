import { createWriteStream, WriteStream } from 'fs';
import { File } from './File';

export class PrintStream {
  ws: WriteStream;
  private file: File;

  constructor(file: File) {
    this.file = file;
    this.reset()
    this.ws.on('error', function (err) {
      throw err;
    });
  }

  close() {
    this.ws.close();
    this.ws = null;
  }

  println(msg: string) {
    this.ws.write(msg + '\n');
  }

  reset() {
    this.ws = createWriteStream(this.file.name)
  }
}
