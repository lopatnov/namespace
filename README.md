# @lopatnov/namespace [![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40lopatnov%2Fnamespace)](https://twitter.com/intent/tweet?text=I%20want%20to%20share%20TypeScript%20library:&url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40lopatnov%2Fnamespace)

[![npm](https://img.shields.io/npm/dt/@lopatnov/namespace)](https://www.npmjs.com/package/@lopatnov/namespace)
[![NPM version](https://badge.fury.io/js/%40lopatnov%2Fnamespace.svg)](https://www.npmjs.com/package/@lopatnov/namespace)
[![License](https://img.shields.io/github/license/lopatnov/namespace)](https://github.com/lopatnov/namespace/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/lopatnov/namespace)](https://github.com/lopatnov/namespace/issues)
[![GitHub forks](https://img.shields.io/github/forks/lopatnov/namespace)](https://github.com/lopatnov/namespace/network)
[![GitHub stars](https://img.shields.io/github/stars/lopatnov/namespace)](https://github.com/lopatnov/namespace/stargazers)
![GitHub top language](https://img.shields.io/github/languages/top/lopatnov/namespace)

[![build-and-test-package](https://github.com/lopatnov/namespace/workflows/build-and-test-package/badge.svg)](https://github.com/lopatnov/namespace/tree/master/tests)
[![publish-npm-package](https://github.com/lopatnov/namespace/workflows/publish-npm-package/badge.svg)](https://github.com/lopatnov/namespace/releases)
[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/@lopatnov/namespace)](https://www.npmjs.com/package/@lopatnov/namespace?activeTab=dependencies)

[![Patreon](https://img.shields.io/badge/Donate-Patreon-informational)](https://www.patreon.com/lopatnov)
[![sobe.ru](https://img.shields.io/static/v1?label=sobe.ru&message=%D0%9A%D0%BD%D0%B8%D0%B3%D0%B8&color=yellow&logo=data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAArlBMVEUAAAD//////////////////////////////////////////////////////////////////PP/3l7/9c//0yb/zAD/6ZP/zQf/++7/3FD/88X/0h7//v7/5oX/zATUqQDktgD/5HjQpgAFBACQcwD/zw/fsgCOcQD6yADZrQD2xAD8yQDnuADxwADcsADbrwDpugD3xQD5xwDjtQDywQD+ywD9ygDvvwD7yAD/1jRaObVGAAAAEHRSTlMAA3zg707pEJP8MMUBYN5fiwXJMQAAAAFiS0dEAf8CLd4AAAAHdElNRQflBgMAAxO4O2jCAAAAuElEQVQoz42S1w7CMAxFS8ueYZgNLZuyRynw/z9GdtxIkbgPceQT6Tq2vZwfEKx8wRPyiaViSYDABqQsAMq0OzxUqhbo9kBcavUM6A9AAtJAYDgC0ID7i+t4AghwfxanszlAGBnA/Flc0MfL1doA5s/ChoLtbg8QI392gpIBzf/AwYAWAsdTrIE05/nz5Xq7S6DKpenHM0pe+o/qg5Am74/0ybTkm+q6wG4iltV2LTko52idy+Banx9RYiS6Vrsc3AAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMS0wNi0wM1QwMDowMzoxOCswMDowMLvSSCkAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjEtMDYtMDNUMDA6MDM6MTgrMDA6MDDKj/CVAAAAAElFTkSuQmCC)](https://sobe.ru/na/tech_knigi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-lopatnov-informational?style=social&logo=linkedin)](https://www.linkedin.com/in/lopatnov/)

Dynamic namespace creation

## Install

[![https://nodei.co/npm/@lopatnov/namespace.png?downloads=true&downloadRank=true&stars=true](https://nodei.co/npm/@lopatnov/namespace.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/@lopatnov/namespace)

```shell
npm install @lopatnov/namespace
```

[Browser](//lopatnov.github.io/namespace/dist/namespace.js)

```html
<script src="//lopatnov.github.io/namespace/dist/namespace.min.js"></script>
```

## Import package to the project

### TypeScript

```typescript
import Namespace from "@lopatnov/namespace";
```

### JavaScript

```javascript
var Namespace = require("@lopatnov/namespace");
```

## TypeScript and JavaScript samples

### new operator

```ts
var n = new Namespace("Hello.World");
console.log((n as any).Hello.World instanceof Namespace);
```

```js
window.globalSpace = new Namespace(
  "Eeny.meeny.miny.moe[Catch][a][tiger][by][the][toe]"
);
console.log(Eeny.meeny.miny.moe.Catch.a.tiger.by.the.toe);
```

### direct call

```js
var n = Namespace("A.Pacific.Ocean"); // <-- without new
console.log(n.A.Pacific.Ocean instanceof Namespace);
```

### apply namespace object to another

```ts
var x = new Namespace("Games.World");
var y = {};
var z = x.goto("Games.World");

x.applyTo(y, "Hello");
console.log(z === y.Hello.Games.World); // true
```

```ts
var space: any = {};
var n = new Namespace("cruising.airliner");
n.applyTo(space, "A"); // <-- applyTo(context: any, name: string): void
console.log(space.A.cruising.airliner instanceof Namespace);
```

### get inner object

```ts
var n: any = new Namespace("Yellow.Submarine");
var y = n.goto("Yellow.Submarine"); // <-- goto(path: NamespacePath): any
console.log(y === n.Yellow.Submarine);
```

### make inner namespace

```ts
const glob: Namespace & any = new Namespace();

function namespace(path: string) {
  return function (
    target: any,
    propertyKey?: string,
    descriptor?: PropertyDescriptor
  ) {
    const ns = glob.namespace(path); // <-- make inner namespace
    const name = propertyKey || target.prototype.constructor.name;
    ns[name] = propertyKey ? target[propertyKey] : target;
  };
}

@namespace("white.animals")
class Actions {
  @namespace("white.animals")
  makeAlbino(animal: string) {
    return `${animal} is white now`;
  }
}

console.log(glob.white.animals.makeAlbino("unicorn")); // 'unicorn is white now'
console.log(new glob.white.animals.Actions().makeAlbino("rose panther")); // 'rose panther is white now'
```

### check if path exists

```ts
const ns = new Namespace();
ns.namespace("a.b.c.d");
ns.namespace("a.b.c.e");
ns.namespace("a.b.f.g");
ns.namespace("a.i.h.k");
ns.namespace("a.i.h.l");
ns.namespace("a.m.n.o");

console.log(ns.exists('a.b.c.d'));
console.log(ns.exists('a.b.c.e'));
console.log(ns.exists('a.b.f.g'));
console.log(ns.exists('a.i.h.k'));
console.log(ns.exists('a.i.h.l'));
console.log(ns.exists('a.m.n.o'));
```

## Demo

See, how it's working: [https://runkit.com/lopatnov/namespace](https://runkit.com/lopatnov/namespace)

Test it with a runkit: [https://npm.runkit.com/@lopatnov/namespace](https://npm.runkit.com/%40lopatnov%2Fnamespace)

## Rights and Agreements

License [Apache-2.0](https://github.com/lopatnov/namespace/blob/master/LICENSE)

Copyright 2020 Oleksandr Lopatnov
