(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Namespace = factory());
}(this, (function () { 'use strict';

  /** Namespace class */
  var Namespace = /** @class */ (function () {
      function Namespace(path) {
          if (!(this instanceof Namespace))
              return new Namespace(path);
          this.init(path);
      }
      Namespace.prototype.init = function (path) {
          if (this.isValidPath(path)) {
              var pathArr = this.parsePath(path);
              var childName = pathArr.shift();
              if (this.isValidKey(childName)) {
                  this.appendChildren(pathArr, childName);
              }
          }
      };
      Namespace.prototype.isValidPath = function (path) {
          return typeof path === 'string' || (Array.isArray(path) && path.length > 0);
      };
      Namespace.prototype.parsePath = function (path) {
          var _this = this;
          return Array.isArray(path) ? path : path.split(this.getSplitter()).filter(function (x) { return _this.filterName(x); });
      };
      Namespace.prototype.getSplitter = function () {
          return /[\[\]."']/gi;
      };
      Namespace.prototype.filterName = function (name) {
          return !!name && !!name.trim();
      };
      Namespace.prototype.isValidKey = function (name) {
          return typeof name === 'string';
      };
      Namespace.prototype.getNamespaceClass = function () {
          return this instanceof Namespace ? this.constructor : Namespace;
      };
      Namespace.prototype.take = function (path) {
          var isValidPath = this.isValidPath(path);
          var context = this;
          var errContext = undefined;
          var exists = true;
          var parts = [];
          var part;
          if (isValidPath) {
              parts = this.parsePath(path);
              while (parts.length > 0) {
                  part = parts.shift();
                  if (part && context[part]) {
                      context = context[part];
                  }
                  else {
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
              exists: exists,
              isValidPath: isValidPath
          };
      };
      Namespace.prototype.appendChildren = function (path, propName) {
          var nsc = this.getNamespaceClass();
          var ns = new nsc(path);
          ns.applyTo(this, propName);
          return ns;
      };
      Namespace.prototype.applyTo = function (context, name) {
          if (!this.isValidKey(name))
              throw new Error("name of context is " + ('' + name));
          context[name] = this;
      };
      Namespace.prototype.exists = function (path) {
          var res = this.take(path);
          return res.exists;
      };
      Namespace.prototype.goto = function (path) {
          var res = this.take(path);
          if (res.exists) {
              return res.last;
          }
          return res.errLast;
      };
      Namespace.prototype.namespace = function (path) {
          var res = this.take(path);
          if (!res.exists) {
              var last = this.appendChildren.call(res.last, res.left.slice(), res.lastName);
              return last.goto(res.left);
          }
          return res.last;
      };
      return Namespace;
  }());

  return Namespace;

})));
//# sourceMappingURL=namespace.js.map
