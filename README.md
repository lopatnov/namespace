# @lopatnov/namespace 

[![npm](https://img.shields.io/npm/dt/@lopatnov/namespace)](https://www.npmjs.com/package/@lopatnov/namespace)
[![NPM version](https://badge.fury.io/js/%40lopatnov%2Fnamespace.svg)](https://www.npmjs.com/package/@lopatnov/namespace)
[![License](https://img.shields.io/github/license/lopatnov/namespace)](https://github.com/lopatnov/namespace/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/lopatnov/namespace)](https://github.com/lopatnov/namespace/issues)
[![GitHub forks](https://img.shields.io/github/forks/lopatnov/namespace)](https://github.com/lopatnov/namespace/network)
[![GitHub stars](https://img.shields.io/github/stars/lopatnov/namespace)](https://github.com/lopatnov/namespace/stargazers)
![GitHub top language](https://img.shields.io/github/languages/top/lopatnov/namespace)
[![Libraries.io dependency status for latest release](https://img.shields.io/librariesio/release/npm/@lopatnov/namespace)](https://www.npmjs.com/package/@lopatnov/namespace?activeTab=dependencies)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-lopatnov-informational?style=social&logo=linkedin)](https://www.linkedin.com/in/lopatnov/)

Dynamic namespace creation

## Install

As NPM package

```shell
npm install @lopatnov/namespace
```

As browser script

```html
<script src="//lopatnov.github.io/namespace/dist/namespace.min.js"></script>
```

## Import package to the project

### ESM import

```typescript
import Namespace from "@lopatnov/namespace";
```

### CJS require

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
