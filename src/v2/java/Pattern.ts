export class Matcher {
  private readonly str: string;
  private readonly regexp: RegExp;
  private _result: RegExpMatchArray;

  constructor(str: string, regexp: RegExp) {
    this.str = str;
    this.regexp = regexp;
  }

  find() {
    return this.regexp.test(this.str);
  }

  group(group: number): string {
    return (this._result ?? (this._result = this.str.match(this.regexp)))[group];
  }

  replaceAll(s: string) {
    return this.str.replace(this.regexp, s);
  }
}

export class Pattern {
  private readonly regexp: RegExp;

  constructor(regexp: RegExp) {
    this.regexp = regexp;
  }

  static compile(regexp: RegExp) {
    return new Pattern(regexp);
  }

  matcher(str: string) {
    return new Matcher(str, this.regexp);
  }
}
