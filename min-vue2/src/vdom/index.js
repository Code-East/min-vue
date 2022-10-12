
const isReservedTag = (tag) => { //判断是否是原始标签
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
}

export function createElementVNode(vm, tag, data, ...children) { //生成虚拟node方法
    if (data == null) {
        data = {}
    }
    let key = data.key;
    if (key) {
        delete data.key;
    }

    if (isReservedTag(tag)) { //判断是否为正常的html节点
        return vnode(vm, tag, key, data, children);
    } else { //不是正常的节点 表示是自定义组件
        debugger
        let Ctor = vm.$options.components[tag];
        return createComponentVnode(vm, tag, key, data, children, Ctor);
    }

}

function createComponentVnode(vm, tag, key, data, children, Ctor) { //创建自定义组件的虚拟Dom
    if (typeof Ctor === 'object') {
        vm.$options._base.extend(Ctor);
    }

    data.hook = {
        init(vnode) { //稍后创建真实节点的时候 如果是组件则调用init方法
            //保存组件的实例到虚拟节点上
            let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
            instance.$mount();
        }
    }

    return vnode(vm, tag, key, data, children, null, { Ctor })
}

export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}

//ast不一样 ast做的是语法层面的 html长什么样所以要遵守html的规则 不能加自定义属性v-if等
//虚拟dom是描述dom元素的 可以加自定义属性等 其他功能
function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions
    }
}

export function isSameVnode(vnode1 = {}, vnode2 = {}) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
}