import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom/index";
import { patch } from "./vdom/patch";

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) { //将vnode虚拟DOM转化为真实DOM
        const vm = this;
        const el = vm.$el;

        const prevVnode = vm._vnode;
        vm._vnode = vnode; //把组件第一次产生的虚拟节点保存在_vnode中
        if (prevVnode) { //之前渲染过虚拟节点
            vm.$el = patch(prevVnode, vnode);
        } else {
            vm.$el = patch(el, vnode);
        }
    }
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments); //生成虚拟node方法
    }
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments);
    }
    Vue.prototype._s = function (value) {
        if (typeof value !== 'object') return value;
        return JSON.stringify(value);
    }

    Vue.prototype._render = function () {
        const vm = this;
        //当渲染的时候会去vm实例上取值 我们可以将属性和视图判定在一起
        return vm.$options.render.call(vm); // 通过ast语法转义后生成的render方法 
        //里面会有_c{_c('div',{id:app},null),_v(_s(age))} _c _s _v的各种方法的调用 在上面声明
    }
}
export function mountComponent(vm, el) {
    vm.$el = el;
    //1.调用render方法产生虚拟节点 虚拟DOM
    const udataComponet = () => {
        vm._update(vm._render());
    }
    let watcher = new Watcher(vm, udataComponet, true);
    //2.根据虚拟DOM产生真实DOM

    //3.插入到el元素中
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if (handlers) {
        handlers.forEach(handlers => handlers.call(vm));
    }
}