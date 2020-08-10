(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Namespace = factory());
}(this, (function () { 'use strict';

  /** Namespace class */
  var Namespace = /** @class */ (function () {
      function Namespace(name) {
          this.validate(name);
          var p = this.parseName(name);
          var n = p.shift();
          if (this.init(n)) {
              var ns = new Namespace.Default(p);
              ns.applyTo(this, n);
          }
      }
      Namespace.prototype.parseName = function (name) {
          return Array.isArray(name) ? name : name.split(/[\[\]."']/gi).filter(function (x) { return !!x && !!x.trim(); });
      };
      Namespace.prototype.validate = function (name) {
          if (!name) {
              throw new Error('The Namespace name doesn\'t exists');
          }
      };
      Namespace.prototype.init = function (name) {
          return typeof name === 'string';
      };
      Namespace.prototype.applyTo = function (context, name) {
          context[name] = this;
      };
      Namespace.prototype.goto = function (name) {
          var context = this;
          if (name && name.length) {
              var parts = this.parseName(name);
              for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                  var part = parts_1[_i];
                  context = context[part];
              }
          }
          return context;
      };
      Namespace.Default = Namespace;
      return Namespace;
  }());

  return Namespace;

})));
//# sourceMappingURL=namespace.js.map
