import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;
// 1)当我们创建渲染watcher的时候我们会把当前渲染的watcher放到Dep.target上
// 2）调用_render() 会取值走到get上
class Watcher { //不同组件有不同的watcher 
    constructor(vm, exprOrFn, options, cb) {
        this.id = id++;
        this.renderWatcher = options; //标识是一个渲染的watcher

        if (typeof exprOrFn === 'string') {
            this.getter = function () {  //getter调用可以发生取值操作
                return vm[exprOrFn];
            }
        } else {
            this.getter = exprOrFn; //getter调用可以发生取值操作
        }

        this.deps = []; //实现计算属性和watch
        this.depsId = new Set();
        this.lazy = options.lazy;
        this.cb = cb;
        this.dirty = this.lazy; //缓存值
        this.value = this.lazy ? undefined : this.get();
        this.user = options.user;
        this.vm = vm;
    }
    evaluate() {
        this.value = this.get(); //获取到computend函数执行的返回值
        this.dirty = false;
    }
    get() {
        pushTarget(this) //把当前的watcher放入Dep的静态属性
        let value = this.getter.call(this.vm); //去vm上取值
        popTarget(); //渲染完成后清空
        return value;
    }
    addDep(dep) { //一个组件对应多个属性 重复的属性不用记录
        let id = dep.id;
        if (!this.depsId.has(id)) { //根据dep的id 去重
            this.deps.push(dep);
            this.depsId.add(id);
            dep.addSub(this);
        }
    }
    depend() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].depend(); //让计算属性watcher 也收集渲染
        }
    }
    updata() { //更新视图
        if (this.lazy) {
            //如果是计算属性 依赖的值变化可 就标识计算属性为脏值 表示需要重新获取
            this.dirty = true;
        } else {
            queueWatcher(this);//把当前的waycher暂存起来
        }
        // this.get();
    }
    run() {
        let oldval = this.value;
        let newval = this.get();
        if (this.user) {
            this.cb.call(this.vm, newval, oldval);
        }
    }
}
let queue = [];
let has = {};
let pending = false; //防抖
function flushSchedulerQueue() {
    let flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(q => q.run());
}
function queueWatcher(watcher) { //使用定时器进行防抖
    const id = watcher.id;
    if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        if (!pending) {
            nextTick(flushSchedulerQueue, 0)
            pending = true;
        }
    }
}

let callbacks = [];
let waiting = false;

function flushCallbasks() {
    let cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(cb => cb()); //按照顺序依次执行
}

export function nextTick(cb) {
    callbacks.push(cb); //维护nextTick中的callback方法
    if (!waiting) {
        setTimeout(() => {
            flushCallbasks(); //最后一起刷新
        }, 0)
        waiting = true;
    }
}

//需要给每一个属性增加一个 dep 目的就是收集watcher
//一个组件有多个属性 n个dep对应一个watcher 1个属性对应多个组件
//watcher和dep是多对多的关系
export default Watcher;