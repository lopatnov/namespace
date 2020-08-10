type NamespacePath = string | Array<string>;

/** Namespace class */
export default class Namespace {
  constructor(path?: NamespacePath) {
    if (!(this instanceof Namespace))
      return new Namespace(path);
    this.init(path);
  }

  protected init(path: NamespacePath | undefined) {
    if (this.isValidPath(path)) {
      const pathArr = this.parsePath(path as string | Array<string>);
      const childName = pathArr.shift();
      if (this.isValidKey(childName)) {
        this.appendChildren(pathArr, childName as string);
      }
    }
  }

  private isValidPath(path: NamespacePath | undefined) {
    return typeof path === 'string' || (Array.isArray(path) && path.length > 0);
  }

  private parsePath(path: NamespacePath): string[] {
    return Array.isArray(path) ? path : path.split(this.getSplitter()).filter(x => this.filterName(x))
  }

  protected getSplitter() {
    return /[\[\]."']/gi;
  }

  protected filterName(name: string) {
    return !!name && !!name.trim();
  }

  protected isValidKey(name: string | undefined): boolean {
    return typeof name === 'string';
  }

  protected getNamespaceClass() {
    return this instanceof Namespace ? this.constructor as typeof Namespace : Namespace;
  }

  protected take(path: NamespacePath) {
    const isValidPath = this.isValidPath(path);
    let context: any = this;
    let errContext: any = undefined;
    let exists = true;
    let parts: string[] = [];
    let part: string | undefined;

    if (isValidPath) {
      parts = this.parsePath(path);
      while (parts.length > 0) {
        part = parts.shift();
        if (part && context[part]) {
          context = context[part];
        } else {
          exists = false;
          errContext = part ? context[part] : undefined;
          break;
        }
      }
    }

    return {
      last: context,
      lastName: part,
      errLast: errContext,
      left: parts,
      exists,
      isValidPath
    }
  }

  protected appendChildren(path: NamespacePath | undefined, propName: string) {
    const nsc = this.getNamespaceClass();
    const ns = new nsc(path);
    ns.applyTo(this, propName as string);
    return ns;
  }

  public applyTo(context: any, name: string): void {
    if (!this.isValidKey(name))
      throw new Error(`name of context is ${'' + name}`);
    context[name] = this;
  }

  public exists(path: NamespacePath): boolean {
    const res = this.take(path);
    return res.exists;
  }

  public goto(path: NamespacePath): any {
    const res = this.take(path);
    if (res.exists) {
      return res.last;
    }
    return res.errLast;
  }

  public namespace(path: NamespacePath): Namespace {
    const res = this.take(path);
    if (!res.exists) {
      const last = this.appendChildren.call(res.last, res.left.slice(), res.lastName as string);
      return last.goto(res.left) as Namespace;
    }
    return res.last;
  }
}