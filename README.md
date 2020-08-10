# @lopatnov/namespace

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
[![Twitter](https://img.shields.io/twitter/url?url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40lopatnov%2Fnamespace)](https://twitter.com/intent/tweet?text=I%20want%20to%20share%20TypeScript%20library:&url=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2F%40lopatnov%2Fnamespace)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-lopatnov-informational?style=social&logo=appveyor)](https://www.linkedin.com/in/lopatnov/)

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

## How to use

```ts
window.globalSpace = new Namespace('Eeny.meeny.miny.moe[Catch][a][tiger][by][the][toe]');
```

```ts
var x = new Namespace('Games.World');
var y = {};
var z = x.goto('Games.World');

x.applyTo(y, 'Hello');
console.log(z === y.Hello.Games.World); // true
```

## Demo

See, how it's working: [https://runkit.com/lopatnov/namespace](https://runkit.com/lopatnov/namespace)

Test it with a runkit: [https://npm.runkit.com/@lopatnov/namespace](https://npm.runkit.com/%40lopatnov%2Fnamespace)

## Rights and Agreements

License [Apache-2.0](https://github.com/lopatnov/namespace/blob/master/LICENSE)

Copyright 2020 Oleksandr Lopatnov
