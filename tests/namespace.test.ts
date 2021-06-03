import { assert } from "console";
import Namespace from "../src/namespace";

describe("Base tests", () => {

  it("should create Library", () => {
    var x = new Namespace('Games.World');
    var y: any = {};
    var z = x.goto('Games.World');

    x.applyTo(y, 'Hello');

    expect(y.Hello.Games.World).toBe(z);
  });

  it("should create namespace object by new operator", () => {
    var n: any = new Namespace('Hello.World');
    expect(n.Hello).toBeDefined();
    expect(n.Hello.World).toBeDefined();
    expect(n.Hello.World instanceof Namespace).toBeTruthy();
  });

  it("should create namespace object by new operator", () => {
    var eeny: any = new Namespace('meeny.miny.moe[Catch][a][tiger][by][the][toe]');
    expect(eeny.meeny.miny.moe.Catch.a.tiger.by.the.toe instanceof Namespace).toBeTruthy();
  });

  it("should create namespace object by direct call", () => {
    var dynamicNamespace: any = Namespace;
    var a = dynamicNamespace('Pacific.Ocean');
    expect(a).toBeDefined();
    expect(a.Pacific).toBeDefined();
    expect(a.Pacific.Ocean).toBeDefined();
    expect(a.Pacific.Ocean instanceof Namespace).toBeTruthy();
  });

  it("should apply namespace object to another", () => {
    var space: any = {};
    var n = new Namespace('cruising.airliner');
    n.applyTo(space, 'A');
    expect(space.A && space.A.cruising && space.A.cruising.airliner instanceof Namespace).toBeTruthy();
  });

  it("should apply namespace object to another", () => {
    var persons: any = {};
    var extension = new Namespace('with.small.kitty');

    extension.applyTo(persons, 'Julia');
    extension.applyTo(persons, 'Kathy');
    extension.applyTo(persons, 'Liza');

    expect(persons.Julia.with.small.kitty instanceof Namespace).toBeTruthy();
    expect(persons.Kathy.with.small.kitty instanceof Namespace).toBeTruthy();
    expect(persons.Liza.with.small.kitty instanceof Namespace).toBeTruthy();
  });

  it("should get inner object", () => {
    var n: any = new Namespace('Yellow.Submarine');
    var y = n.goto('Yellow.Submarine');
    expect(y === n.Yellow.Submarine).toBeTruthy();
  });

  it("should goto inner object", () => {
    var kitchenRadar = new Namespace();
    kitchenRadar.namespace('big.fruits');
    kitchenRadar.namespace('big.eggs');
    kitchenRadar.namespace('small.dishes');
    kitchenRadar.namespace('small.cookies');

    var fruits = kitchenRadar.goto('big.fruits');
    var eggs = kitchenRadar.goto('big.eggs');
    var dishes = kitchenRadar.goto('small.dishes');
    var cookies = kitchenRadar.goto('small.cookies');

    expect(fruits === (kitchenRadar as any).big.fruits).toBeTruthy();
    expect(eggs === (kitchenRadar as any).big.eggs).toBeTruthy();
    expect(dishes === (kitchenRadar as any).small.dishes).toBeTruthy();
    expect(cookies === (kitchenRadar as any).small.cookies).toBeTruthy();
  });

  it("should be extendable", () => {
    class HashTag extends Namespace {
      private static space: any = new Namespace();
      public static names = new Set<string>();

      public static get(name: string) {
        return HashTag.space[name];
      }

      constructor(text: string | Array<string>) {
        super(text);
        this.placeTo(HashTag.space);
      }

      protected isValidKey(name: string | undefined): boolean {
        if (name && !HashTag.names.has(name)) {
          HashTag.names.add(name);
        }
        return super.isValidKey(name);
      }

      protected getSplitter() {
        return /[ #]/gi;
      }

      public placeTo(context: any) {
        const keys = Object.getOwnPropertyNames(this);
        for (let key of keys) {
          context[key] = (this as any)[key];
        }
      }

    }

    const hashTag = '#Passengers #unwrapping #pats #of #butter';
    var n = new HashTag(hashTag);
    expect(HashTag.names.has('pats')).toBeTruthy();
    expect(n.goto(hashTag) === HashTag.get('butter')).toBeTruthy();
  });

  it("could be used in decorator", () => {
    const glob: Namespace & any = new Namespace();

    function namespace(path: string) {
      return function(target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        const ns = glob.namespace(path);
        const name = propertyKey || target.prototype.constructor.name;
        ns[name] = propertyKey? target[propertyKey] : target;
      }
    }

    @namespace('white.animals')
    class Actions {
      @namespace('white.animals')
      makeAlbino(animal: string) {
        return `${animal} is white now`;
      }
    }

    expect(glob.white.animals.makeAlbino('unicorn')).toBe('unicorn is white now');
    expect((new glob.white.animals.Actions()).makeAlbino('rose panther')).toBe('rose panther is white now')
  });

  it("should make many namespaces in a single", () => {
    const ns = new Namespace();
    const anyNS: any = ns;

    ns.namespace('a.b.c.d');
    ns.namespace('a.b.c.e');
    ns.namespace('a.b.f.g');
    ns.namespace('a.i.h.k');
    ns.namespace('a.i.h.l');
    ns.namespace('a.m.n.o');

    expect(ns.exists('a.b.c.d')).toBeTruthy();
    expect(ns.exists('a.b.c.e')).toBeTruthy();
    expect(ns.exists('a.b.f.g')).toBeTruthy();
    expect(ns.exists('a.i.h.k')).toBeTruthy();
    expect(ns.exists('a.i.h.l')).toBeTruthy();
    expect(ns.exists('a.m.n.o')).toBeTruthy();
    expect((ns as any).a.b.c.d instanceof Namespace).toBeTruthy();
    expect((ns as any).a.b.c.e instanceof Namespace).toBeTruthy();
    expect(anyNS.a.b.f.g instanceof Namespace).toBeTruthy();
  });

});
