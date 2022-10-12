
import { isFunction, isObject } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

function traversal(value, set = new Set()){ //深度检测对象中的属性
    if (!isObject(value)) return value;
    if (set.has(value)) {
        return value;
    }
    set.add(value);
    for (let key in value) {
        traversal(value[key], set);
    }
    return value;
}

//source是用户传入的对象 cb就是对应的用户的回调
export function watch(source, cb){
    let getter;
    if (isReactive(source)) {
        //对用户传入的数据 进行循环
        getter = () => traversal(source);
    }else if(isFunction(source)){
        getter = source
    }else{
        return;
    }
    let cleanup;
    const onCleanup = (fn) => {
        cleanup = fn; //保存用户的函数
    }
    let oldValue;
    const job = () => { //修改依赖的值 就会触发这个函数 从新的执行effect方法 获取到最新的值
        if (cleanup) {
            cleanup(); //下次watch触发就清理上次的watch
        }
        const newValue = effect.run();
        cb(newValue,oldValue);
        oldValue = newValue;
    }
    const effect = new ReactiveEffect(getter, job); //监控自己的构造函数 变化后重新执行job
    oldValue = effect.run();
}