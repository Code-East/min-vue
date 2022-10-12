import { isObject } from "@vue/shared";
import { activeEffect, track, trigger } from "./effect"
import { reactive } from "./reactive";
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            //当一个使用Proxy代理过的对象 在进来取值就会发现到 return出去
            return true;
        }
        track(target, 'get', key);
        const res = Reflect.get(target, key, receiver);
        if (isObject(res)) {
            return reactive(res); //深度代理
        }
        return res;
    },
    set(target, key, value, receiver) {
        //设置值
        let oldValue = target[key];
        let result = Reflect.set(target, key, value, receiver);
        if (oldValue !== value) { //值变化了
            //要更新
            trigger(target, 'set', key, value, oldValue);
        }

        return result;
    }

}