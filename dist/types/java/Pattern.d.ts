export declare class Matcher {
    private readonly str;
    private readonly regexp;
    private _result;
    constructor(str: string, regexp: RegExp);
    find(): boolean;
    group(group: number): string;
    replaceAll(s: string): string;
}
export declare class Pattern {
    private readonly regexp;
    constructor(regexp: RegExp);
    static compile(regexp: RegExp): Pattern;
    matcher(str: string): Matcher;
}
//# sourceMappingURL=Pattern.d.ts.map