/** Namespace class */
export default class Namespace {
    static Default: typeof Namespace;
    constructor(name: string | Array<string>);
    private parseName;
    protected validate(name: string | Array<string>): void;
    protected init(name: string | undefined): boolean;
    applyTo(context: any, name: string): void;
    goto(name: string | Array<string>): Namespace;
}
