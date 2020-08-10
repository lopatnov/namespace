/** Namespace class */
export default class Namespace {
  static Default = Namespace;

  constructor(name: string | Array<string>) {
    this.validate(name);
    const p = this.parseName(name);
    const n = p.shift();
    if (this.init(n)) {
      const ns = new Namespace.Default(p);
      ns.applyTo(this, n as string);
    }
  }

  private parseName(name: string | Array<string>) {
    return Array.isArray(name) ? name : name.split(/[\[\]."']/gi).filter(x => !!x && !!x.trim())
  }

  protected validate(name: string | Array<string>) {
    if (!name) {
      throw new Error('The Namespace name doesn\'t exists');
    }
  }

  protected init(name: string | undefined): boolean {
    return typeof name === 'string';
  }

  public applyTo(context: any, name: string) {
    context[name] = this;
  }

  public goto(name: string | Array<string>): Namespace {
    let context: any = this;
    if (name && name.length) {
      const parts = this.parseName(name);
      for (const part of parts) {
        context = context[part];
      }
    }
    return context;
  }
}
