"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
// ObjectPool.js from Ecsy
var ObjectPool = /** @class */ (function () {
    function ObjectPool(T, initialSize) {
        this.freeList = [];
        this.count = 0;
        this.T = T;
        this.isObjectPool = true;
        var extraArgs = null;
        if (arguments.length > 1) {
            extraArgs = Array.prototype.slice.call(arguments);
            extraArgs.shift();
        }
        this.createElement = extraArgs
            ? function () {
                return new (T.bind.apply(T, __spreadArrays([void 0], extraArgs)))();
            }
            : function () {
                return new T();
            };
        if (typeof initialSize !== "undefined") {
            this.expand(initialSize);
        }
    }
    ObjectPool.prototype.aquire = function () {
        // Grow the list by 20%ish if we're out
        if (this.freeList.length <= 0) {
            this.expand(Math.round(this.count * 0.2) + 1);
        }
        var item = this.freeList.pop();
        return item;
    };
    ObjectPool.prototype.release = function (item) {
        item.reset();
        this.freeList.push(item);
    };
    ObjectPool.prototype.expand = function (count) {
        for (var n = 0; n < count; n++) {
            this.freeList.push(this.createElement());
        }
        this.count += count;
    };
    ObjectPool.prototype.totalSize = function () {
        return this.count;
    };
    ObjectPool.prototype.totalFree = function () {
        return this.freeList.length;
    };
    ObjectPool.prototype.totalUsed = function () {
        return this.count - this.freeList.length;
    };
    return ObjectPool;
}());
exports.ObjectPool = ObjectPool;
