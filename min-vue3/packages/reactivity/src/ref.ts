import { isArray, isObject } from "@vue/shared";
import { trackEffects, triggerEffects } from "./effect";
import { reactive } from "./reactive";

function toReactive(value) {
    return isObject(value) ? reactive(value) : value;
}

class RefImpl {
    public dep = new Set();
    public _value;
    public _v_isRef = true;
    constructor(public rawValue) {
        this._value = toReactive(rawValue);
    }
    get value() {
        //依赖收集
        trackEffects(this.dep);
        return this._value;
    }
    set value(newValue) {
        if (!newValue !== this.rawValue) {
            this._value = toReactive(newValue);
            this.rawValue = newValue;
            //修改 触发更新 从新获取最新的属性值
            triggerEffects(this.dep);
        }
    }
}

export function ref(value) {
    return new RefImpl(value)
}

class ObjectRefImpl { //代理方法 就相当于做了一层defineProperty的代理 取值的时候就使用原本对象的值
    constructor(public object, public key) { }
    get value() {
        return this.object[this.key]
    }
    set value(newValue) {
        this.object[this.key] = newValue;
    }
}

export function toRef(object, key) {
    return new ObjectRefImpl(object, key)
}

export function toRefs(object) {  //将reactive对象中的属性 变为ref
    const result = isArray(object) ? new Array(object.length) : {};
    for (let key in object) {
        result[key] = toRef(object, key); //代理
    }
    return result;
}

export function proxyRefs(object) { //代理一个ref 就可以在页面上直接的使用属性 而不需要使用.value来访问
    return new Proxy(object, {
        get(target, key, receiver) {
            let r = Reflect.get(target, key, receiver);
            return r._v_isRef ? r.value : r;
        },
        set(target, key, value, receiver) {
            let oldValue = target[key];
            if (oldValue._v_isRef) {
                oldValue.value = value
                return true;
            } else {
                return Reflect.set(target, key, value, receiver);
            }
        },
    })
}
