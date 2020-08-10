/** Namespace class */
var Namespace = /** @class */ (function () {
    function Namespace(name) {
        if (!(this instanceof Namespace))
            return new Namespace(name);
        this.validate(name);
        var p = this.parseName(name);
        var n = p.shift();
        if (this.init(n)) {
            var nsc = this.getNamespaceClass();
            var ns = new nsc(p);
            ns.applyTo(this, n);
        }
    }
    Namespace.prototype.getNamespaceClass = function () {
        return this.constructor;
    };
    Namespace.prototype.parseName = function (name) {
        var _this = this;
        return Array.isArray(name) ? name : name.split(this.getSplitter()).filter(function (x) { return _this.filterName(x); });
    };
    Namespace.prototype.getSplitter = function () {
        return /[\[\]."']/gi;
    };
    Namespace.prototype.filterName = function (name) {
        return !!name && !!name.trim();
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
        if (name) {
            context[name] = this;
        }
        else {
            this.placeTo(context);
        }
    };
    Namespace.prototype.placeTo = function (context) {
        var keys = Object.getOwnPropertyNames(this);
        for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
            var key = keys_1[_i];
            context[key] = this[key];
        }
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
    return Namespace;
}());
export default Namespace;
//# sourceMappingURL=namespace.js.map