// ObjectPool.js from Ecsy
export class ObjectPool {
    freeList: any[];
    count: number;
    T: any;
    isObjectPool: boolean;
    createElement: () => any;

    constructor(T: any, initialSize: number) {
        this.freeList = [];
        this.count = 0;
        this.T = T;
        this.isObjectPool = true;

        var extraArgs: any[] | null = null;
        if (arguments.length > 1) {
            extraArgs = Array.prototype.slice.call(arguments);
            extraArgs.shift();
        }

        this.createElement = extraArgs
            ? () => {
                return new T(...<any[]>extraArgs);
            }
            : () => {
                return new T();
            };

        if (typeof initialSize !== "undefined") {
            this.expand(initialSize);
        }
    }

    aquire() {
        // Grow the list by 20%ish if we're out
        if (this.freeList.length <= 0) {
            this.expand(Math.round(this.count * 0.2) + 1);
        }

        var item = this.freeList.pop();

        return item;
    }

    release(item: any) {
        item.reset();
        this.freeList.push(item);
    }

    expand(count: number) {
        for (var n = 0; n < count; n++) {
            this.freeList.push(this.createElement());
        }
        this.count += count;
    }

    totalSize() {
        return this.count;
    }

    totalFree() {
        return this.freeList.length;
    }

    totalUsed() {
        return this.count - this.freeList.length;
    }
}