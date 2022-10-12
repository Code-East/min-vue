import Dep from "./observe/dep";
import { observe } from "./observe/index";
import Watcher, { nextTick } from "./observe/watcher";

//初始化状态
export function initState(vm) {
    const opts = vm.$options; //获取到所有的选择
    if (opts.data) { //判断是否存在data
        initData(vm); //存在data 就调用初始化data方法
    }
    if (opts.computed) { //判断是否存在computed
        initComputed(vm); //存在就初始化computed
    }
    if (opts.watch) {
        initWatch(vm);
    }
}

function proxy(vm, target, key) { //vm是实例 target是 _data key是_data中的属性
    //为vm判断 _data中的所有属性 并是响应式的 使其可以使用 this.key 来访问data中的属性
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key];
        },
        set(newVal) {
            if (vm[target][key] === newVal) return;
            vm[target][key] = newVal;
        }
    })
}

//初始化data配置项
function initData(vm) {
    let data = vm.$options.data; //取出data data可能是对象 可能是函数
    data = typeof data === 'function' ? data.call(vm) : data; //判断是否是函数 是函数使用call执行函数返回对象 不是直接接收 

    vm._data = data; //将data放入vm实例的_data中

    //对数据进行劫持 vue2里采用的是 defineProperty
    observe(data);

    //将vm._data用vm来代理 从而使用 this.keys 来直接获取和修改data中的值
    for (let key in data) { //循环代理里面所有的属性
        proxy(vm, '_data', key);
    }
}

function initComputed(vm) {
    const computed = vm.$options.computed;
    //将计算属性的watcher保存到vm上
    const watchers = vm._computedWatchers = {}
    for (let key in computed) {
        let userDef = computed[key];
        let fn = typeof userDef === 'function' ? userDef : userDef.get;
        //创建一个watcher 并且传入计算属性的表示lazy 将属性与watcher对应起来
        watchers[key] = new Watcher(vm, fn, { lazy: true });
        defineComputed(vm, key, userDef);
    }
}

function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get;
    const setter = userDef.set || (() => { });
    //将计算属性变为属性加入vm实例中 就可以this.获取
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

//计算属性不会收集依赖 只会让自己依赖的属性取收集依赖
function createComputedGetter(key) {
    //需要检测是否需要执行这个getter
    return function () {
        const watcher = this._computedWatchers[key]; //获取到对应属性的watcher
        if (watcher.dirty) {
            //如果是脏的就去执行用户传入的函数
            watcher.evaluate(); //求值后变为false 下次就不求值了
        }
        if (Dep.target) { //计算属性出栈后 爱要渲染watcher 应该让计算属性的watcher里面的属性 也去收集上一层的渲染watcher
            watcher.depend();
        }
        return watcher.value; //最后返回的是watcher上的值
    }
}

//初始化watch
function initWatch(vm) {
    let watch = vm.$options.watch;
    for (let key in watch) {
        const handler = watch[key];

        if (Array.isArray(handler)) { //判断watch是否为数组形式
            for (let i = 0; i < array.length; i++) {
                createWactch(vm, key, handler[i])
            }
        } else {
            createWactch(vm, key, handler)
        }
    }
}

function createWactch(vm, key, handler) {
    //字符串或者是函数
    if (typeof handler === 'string') {
        handler = vm[handler];
    }

    return vm.$watch(key, handler);
}

export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    //最终调用的都是这个api
    Vue.prototype.$watch = function (exprOrFn, cb) {
        //当watcher里面依赖的值变化了 就直接执行cb 回调函数
        new Watcher(this, exprOrFn, { user: true }, cb);
    }
}