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
[![sobe.ru](https://img.shields.io/static/v1?label=sobe.ru&message=%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B4%D0%B0%D1%80%D0%BD%D0%BE%D1%81%D1%82%D1%8C&color=yellow&logo=data:image/x-icon;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAArlBMVEUAAAD//////////////////////////////////////////////////////////////////PP/3l7/9c//0yb/zAD/6ZP/zQf/++7/3FD/88X/0h7//v7/5oX/zATUqQDktgD/5HjQpgAFBACQcwD/zw/fsgCOcQD6yADZrQD2xAD8yQDnuADxwADcsADbrwDpugD3xQD5xwDjtQDywQD+ywD9ygDvvwD7yAD/1jRaObVGAAAAEHRSTlMAA3zg707pEJP8MMUBYN5fiwXJMQAAAAFiS0dEAf8CLd4AAAAHdElNRQflBgMAAxO4O2jCAAAAuElEQVQoz42S1w7CMAxFS8ueYZgNLZuyRynw/z9GdtxIkbgPceQT6Tq2vZwfEKx8wRPyiaViSYDABqQsAMq0OzxUqhbo9kBcavUM6A9AAtJAYDgC0ID7i+t4AghwfxanszlAGBnA/Flc0MfL1doA5s/ChoLtbg8QI392gpIBzf/AwYAWAsdTrIE05/nz5Xq7S6DKpenHM0pe+o/qg5Am74/0ybTkm+q6wG4iltV2LTko52idy+Banx9RYiS6Vrsc3AAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyMS0wNi0wM1QwMDowMzoxOCswMDowMLvSSCkAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjEtMDYtMDNUMDA6MDM6MTgrMDA6MDDKj/CVAAAAAElFTkSuQmCC)](https://sobe.ru/na/tech_knigi)
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

### namespace creation

```ts
const ns = new Namespace(); // <-- create namespace variable

ns.namespace("a.b.c.d"); // <-- create inner namespaces
ns.namespace("a.b.c.e"); // <-- Function namespace(path: NamespacePath): Namespace
ns.namespace("a.b.f.g"); // <--
ns.namespace("a.i.h.k"); // <--
ns.namespace("a.i.h.l"); // <--
ns.namespace("a.m.n.o"); // <--

// Access to inner namespaces
const anyNS: any = ns; // <-- to avoid type casting
console.log(anyNS.a.b.f.g instanceof Namespace); // true
console.log((ns as any).a.b.c.d instanceof Namespace); // true
console.log((ns as any).a.b.c.e instanceof Namespace); // true
```

### attach namespace to a current object

```ts
let shapes = {
    color: "green",
    count: 3
};
let shapesSpace = Namespace.attach(shapes); // <-- Namespace.attach(to: T) => T & Namespace

shapesSpace.namespace('Triangles');
shapesSpace.namespace('Circles');
shapesSpace.namespace('Rectangles.Squares');

console.log(shapesSpace.exists('Triangles')); // true
console.log(shapesSpace.exists('Circles')); // true
console.log(shapesSpace.exists('Rectangles.Squares')); // true
console.log(shapesSpace.color); // "green"
console.log(shapesSpace.count); // 3
console.log(shapes === shapesSpace); // true
```

#### checking that object inside namespace exists

```ts
// Function exists(path: NamespacePath): boolean
console.log(ns.exists('a.b.c.d')); // true
console.log(ns.exists('a.b.c.e')); // true
console.log(ns.exists('a.b.f.g')); // true
console.log(ns.exists('a.i.h.k')); // true
console.log(ns.exists('a.i.h.l')); // true
console.log(ns.exists('a.m.n.o')); // true
```

### create namespace through direct call

```ts
var dynamicNamespace: any = Namespace; // <-- escape current TypeScript restrictions with any Type
var a = dynamicNamespace('Pacific.Ocean'); // <-- call as function
console.log(a.Pacific.Ocean instanceof Namespace); // true
```

### create namespace through new operator

```ts
var n: any = new Namespace("Hello.World");
console.log(n.Hello.World instanceof Namespace); // true
```

```ts
var eeny: any = new Namespace('meeny.miny.moe[Catch][a][tiger][by][the][toe]');
console.log(eeny.meeny.miny.moe.Catch.a.tiger.by.the.toe instanceof Namespace);  // true
```

### go to inner object

```ts
var kitchenRadar = new Namespace();
    kitchenRadar.namespace('big.fruits');
    kitchenRadar.namespace('big.eggs');
    kitchenRadar.namespace('small.dishes');
    kitchenRadar.namespace('small.cookies');

    var fruits = kitchenRadar.goto('big.fruits'); // <-- goto(path: NamespacePath): any
    var eggs = kitchenRadar.goto('big.eggs');
    var dishes = kitchenRadar.goto('small.dishes');
    var cookies = kitchenRadar.goto('small.cookies');

    console.log(fruits === (kitchenRadar as any).big.fruits); // true
    console.log(eggs === (kitchenRadar as any).big.eggs); // true
    console.log(dishes === (kitchenRadar as any).small.dishes); // true
    console.log(cookies === (kitchenRadar as any).small.cookies); // true
```

### apply namespace as a property of an object

```ts
var persons: any = {};
var extension = new Namespace('with.small.kitty');

extension.applyTo(persons, 'Julia'); // Function applyTo(context: any, name: string): void
extension.applyTo(persons, 'Kathy');
extension.applyTo(persons, 'Liza');

console.log(persons.Julia.with.small.kitty instanceof Namespace); // true
console.log(persons.Kathy.with.small.kitty instanceof Namespace); // true
console.log(persons.Liza.with.small.kitty instanceof Namespace); // true
```

## Demo

See, how it's working: [https://runkit.com/lopatnov/namespace](https://runkit.com/lopatnov/namespace)

Test it with a runkit: [https://npm.runkit.com/@lopatnov/namespace](https://npm.runkit.com/%40lopatnov%2Fnamespace)

## Rights and Agreements

License [Apache-2.0](https://github.com/lopatnov/namespace/blob/master/LICENSE)

Copyright 2020–2021 Oleksandr Lopatnov
