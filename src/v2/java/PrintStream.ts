import { createWriteStream, WriteStream } from 'fs';
import { File } from './File';

export class PrintStream {
  ws: WriteStream;

  constructor(file: File) {
    this.ws = createWriteStream(file.name);
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
}
