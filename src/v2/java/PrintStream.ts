import {createWriteStream, WriteStream} from "fs";

export class PrintStream {
    ws: WriteStream;

    constructor(name: string) {
        this.ws = createWriteStream(name);
        this.ws.on("error", function (err) {
            throw err;
        });
    }

    close() {
        this.ws.close();
        this.ws = null;
    }

    writeln(msg: string) {
        this.ws.write(msg + "\n");
    }
}