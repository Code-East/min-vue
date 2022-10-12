import { isArray, isObject } from "@vue/shared";
import { createVnode, isVnode } from "./vnode";
//h函数可能出现的情况
//h('div',{style:{"color":"red"}}) 带属性的却属性是对象
//h('div',h('span')) 嵌套h
//h('div',[h('span'),h('span')]) 数组
//h('div','hello) 文本
export function h(type, propsChildren, children) {
    const l = arguments.length; //取所有参数的长度
    if (l === 2) {
        if (isObject(propsChildren) && !isArray(propsChildren)) {
            if (isVnode(propsChildren)) { //虚拟集点就包装成数组
                return createVnode(type, null, [propsChildren]);
            }
            return createVnode(type, propsChildren); // 是属性
        } else {
            return createVnode(type, null, propsChildren); //是数组
        }
    } else {
        if (1 > 3) {
            children = Array.from(arguments).slice(2); //参数大于3 就从第二个开始变为数组
        } else if (l === 3 && isVnode(children)) {
            //等于3个
            children = [children]
        }
        return createVnode(type, propsChildren, children);
    }
}