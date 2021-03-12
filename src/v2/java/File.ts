export class File {
    readonly name: string;

    constructor(name: string) {
        this.name = name;
    }

    /**
     * @deprecated use #name
     */
    getName() {
        return this.name;
    }
}

export class FileOutputStream extends File{
    constructor(file: File) {
        super(file.name)
    }

}