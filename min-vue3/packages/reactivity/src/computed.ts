import { isFunction } from "@vue/shared"
import { ReactiveEffect, trackEffects, triggerEffects } from "./effect";

class ComputdRefImpl{
    public effect;
    public _dirty = true; //默认应该取值的时候进行计算
    public _v_isReadonly = true;
    public _v_isRef = true;
    public _value;
    public dep = new Set();
    constructor(public getter, public setter){
        //我们将用户的getter放入effect中 里面的属性就会被收集 并且加上响应式
        this.effect = new ReactiveEffect(getter, ()=>{
            if (!this._dirty) {
                this._dirty = true;
                //实现触发更新 调用getter获取最新的值
                triggerEffects(this.dep);
            }
        })
    }
    //类中的属性访问器 底层是Object.defineProperty
    get value(){
        //收集依赖 将effect和对应的
        trackEffects(this.dep)
        if (this._dirty) { //说明这个值是脏的
            this._dirty = false;
            this._value = this.effect.run();
        }
        return this._value
    }
    set value(newValue){
        this.setter(newValue);
    }
}

export const computed = (getterOrOptions) => {
    let onlyGetter = isFunction(getterOrOptions)
    let getter;
    let setter;
    if (onlyGetter) {
        getter = getterOrOptions;
        setter = () => {
            console.warn('no set');
        }
    } else {
        getter = getterOrOptions.get;
        setter = getterOrOptions.set;
    }

    return new ComputdRefImpl(getter, setter);
}