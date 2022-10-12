export let activeEffect = undefined;

function cleanupEffect(effect) {
    const { deps } = effect;
    for (let i = 0; i < deps.length; i++) {
        deps[i].delete(effect); //删除对应的effect
    }
    effect.deps.length = 0;
}

export class ReactiveEffect {
    //这里表示在实例上 新增了active属性
    public active = true; //这个effect默认是激活状态
    public parent = null; //当前effect的父级 可能是另一个effect
    public deps = []; //记住依赖属性的数组
    constructor(public fn, public scheduler) { };//用户传递的参数 也会放入this上
    run() { //run就是执行effect
        if (!this.active) { this.fn() }; //这里表示如果是非激活的情况 只需要执行函数 不需要进行依赖收集
        //这里这要依赖收集了 运行这些就行将当前effect
        try {
            this.parent = activeEffect;
            activeEffect = this;
            //在执行用户函数之前 将之前收集的内容清空
            cleanupEffect(this);
            return this.fn();
        } finally {
            activeEffect = this.parent;
            // this.parent = null;
        }
    }
    stop() {
        if (this.active) {
            this.active = false;
            cleanupEffect(this); //停止effect的收集
        }
    }
}
//一个effect对应多个属性 一个属性对应多个effect 对多对 与vue2的dep和watch一样
export function effect(fn, options: any = {}) {
    //fn可以根据状态变化重新执行 effect可以嵌套着写
    const _effect = new ReactiveEffect(fn, options.scheduler); //创建响应式effect
    _effect.run(); //默认执行一次
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect; //将effect挂载到runner函数上
    return runner;
}

const targetMap = new WeakMap();
export function track(target, type, key) { //收集依赖方法
    if (!activeEffect) return; //判断是否是在effect执行
    let depsMap = targetMap.get(target); //查看对象是否被收集过了
    if (!depsMap) {
        //没收集过 将当前对象放入weakmap中
        targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key); //查看当前属性 是否被收集
    if (!dep) {
        //没有收集 就加入收集到Map
        depsMap.set(key, (dep = new Set()))
    }
    trackEffects(dep);
}

export function trackEffects(dep) {
    let shouldTrack = !dep.has(activeEffect); //如果存入了对应的effect就去重
    if (shouldTrack) {
        //没存就加入effect到对应的属性中
        dep.add(activeEffect);
        activeEffect.deps.push(dep); //让effect记录对应dep
    }
}

export function trigger(target, type, key, value, oldValue) { //修改属性 触发effect执行
    const depsMap = targetMap.get(target);
    if (!depsMap) return; //触发的值不在模板中
    let effects = depsMap.get(key); //找到了属性对应的effect
    if (effects) {
        triggerEffects(effects);
    }
}

export function triggerEffects(effects) {
    effects = new Set(effects); //拷贝一份set
    effects.forEach(effect => { //找到属性对应的effect函数 执行函数 获取到最新的值
        if (effect !== activeEffect) {
            //在执行effect的时候 又要执行自己 就需要屏蔽不要无限调用
            if (effect.scheduler) {
                effect.scheduler(); //如果用户传入了调度函数
            } else {
                effect.run();
            }
        }
    });
}