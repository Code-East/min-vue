import { isObject } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";


const reactiveMap = new WeakMap(); //定义WeakMap来 存入已经做过proxy的对象

export function isReactive(value){
    return !!(value && value[ReactiveFlags.IS_REACTIVE]);
}

export function reactive(target) {
    if (!isObject(target)) { //判断是否为对象
        return;
    }
    if (target[ReactiveFlags.IS_REACTIVE]) {
        //判断是否是一个代理对象(Proxy) 是的话就会去调用Proxy get方法取(ReactiveFlags.IS_REACTIVE)这个 
        //下面的get发现你在取这个就知道了你是被代理过的对象 就直接返回
        return target;
    }
    let exisitingProxy = reactiveMap.get(target);
    if (exisitingProxy) { //判断当前target是否被代理过了
        return exisitingProxy; //代理过了就返回对应的Proxy
    }
    //没有重新定义属性，只是代理，在取值的时候调用get，当前赋值就会调用set

    const proxy = new Proxy(target, mutableHandlers)
    reactiveMap.set(target, proxy); //将代理完成的对象 存入MeakMap中
    return proxy;
}