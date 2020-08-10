declare type NamespacePath = string | Array<string>;
/** Namespace class */
export default class Namespace {
    constructor(path?: NamespacePath);
    protected init(path: NamespacePath | undefined): void;
    private isValidPath;
    private parsePath;
    protected getSplitter(): RegExp;
    protected filterName(name: string): boolean;
    protected isValidKey(name: string | undefined): boolean;
    protected getNamespaceClass(): typeof Namespace;
    protected take(path: NamespacePath): {
        last: any;
        lastName: string | undefined;
        errLast: any;
        left: string[];
        exists: boolean;
        isValidPath: boolean;
    };
    protected appendChildren(path: NamespacePath | undefined, propName: string): Namespace;
    applyTo(context: any, name: string): void;
    exists(path: NamespacePath): boolean;
    goto(path: NamespacePath): any;
    namespace(path: NamespacePath): Namespace;
}
export {};
