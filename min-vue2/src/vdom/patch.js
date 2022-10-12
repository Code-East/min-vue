import { isSameVnode } from '../vdom/index'

function createComponent(vnode){
    let i = vnode.data;
    if ((i = i.hook) && (i = i.init)) {
        i(vnode); //初始化组件
    }
    if (vnode.componentInstance) {
        return true;
    }
}

export function createElm(vnode) { //创建真实节点方法
    let { tag, data, children, text } = vnode;
    if (typeof tag === 'string') { //标签

        //创建真实元素 主要区分是组件还是元素
        if (createComponent(vnode)) { //组件
            return vnode.componentInstance.$el;
        }

        vnode.el = document.createElement(tag); //将真实节点和虚拟节点对应起来 方便后面修改更新
        patchProps(vnode.el, {}, data); //为真实节点加入对应的属性
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        });
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;

}

export function patchProps(el, oldProps = {}, props = {}) {
    //老节点的属性中有新节点没有 要删除老的节点
    let oldStyles = oldProps.style || {};
    let newStyles = props.style || {};
    for (let key in oldStyles) {//老节点有的样式属性
        if (!newStyles[key]) { //新节点没有这个样式属性
            el.style[key] = '' //就删除这个样式属性
        }
    }
    for (let key in oldProps) {//老节点中有的属性
        if (!props[key]) {  //新节点没有这个属性
            el.removeAttribute(key) //删除节点中的这个属性
        }
    }

    //新节点的属性 老节点没有 就全部替换老节点属性
    for (let key in props) { // 用新的属性 替换老的属性
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName];
            }
        } else {
            el.setAttribute(key, props[key]);
        }
    }
}

export function patch(oldVNode, vnode) {

    if (!oldVNode) { //这就是组件的挂载
        return createElm(vnode);
    }

    //初次渲染流程
    const isRealElement = oldVNode.nodeType; //nodeType是js原生的方法 如果是真实的DOM会返回1
    if (isRealElement) { //真实DOM元素
        const elm = oldVNode; //获取到真实DOM元素
        const parentElm = elm.parentNode; //拿到父节点
        let newElm = createElm(vnode); //根据虚拟DOM 创建真实DOM
        parentElm.insertBefore(newElm, elm.nextSibling); //插入新的的DOM 到老的DOM后
        parentElm.removeChild(elm); //再删除原来的节点

        return newElm;
    } else {//else的话 表示两个都是虚拟节点 就需要进行diff算法就是更新算法
        //diff算法是平级比较的 父节点和父节点 子节点和子节点对比

        //1.两个节点不是同一个节点 直接删除老的节点换上新的节点(没有对比)
        //2.两个节点是同一个节点(判断节点的tag 和 节点的key) 对比两个节点的属性是否有差异(复用老的及诶单，将差异的属性进行操作)
        //3.节点比较完毕后就需要比较两个节点的子节点了
        return patchVnode(oldVNode, vnode)
    }
}

function patchVnode(oldVNode, vnode) { //对比更新节点方法
    //1.两个节点不是同一个节点 直接删除老的节点换上新的节点(没有对比)
    if (!isSameVnode(oldVNode, vnode)) { //不是相同节点
        //用老节点的父节点 进行替换
        let el = createElm(vnode);
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el);
        return el;
    }
    //文本的情况 需要对比一下文本的内容
    let el = vnode.el = oldVNode.el; //复用老节点的元素
    if (!oldVNode.tag) { //是文本
        if (oldVNode.text !== vnode.text) { //两个节点的文本不同
            el.textContent = vnode.text; //用新的覆盖老的文本
        }
    }
    //是标签 我们需要比较标签的属性
    patchProps(el, oldVNode.data, vnode.data)

    //比较儿子节点 比较的情况是一方有儿子 一方没儿子 或者 两边都有儿子
    let oldChildren = oldVNode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) { //两个人都有儿子
        //完整的diff算法 需要比较两个节点的子节点
        updateChildren(el, oldChildren, newChildren) //子节点还有子节点 就递归调用
    } else if (newChildren.length > 0) { //老节点没有子节点 新的有
        mountChildren(el, newChildren); //加入新的子节点到父节点
    } else if (oldChildren.length > 0) { //老节点有子节点 新的没有
        el.innerHTML = ''; //删除老的所有子节点
    }

    return el;
}

function mountChildren(el, newChildren) { //加入新的子节点到父节点
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        el.appendChild(createElm(child))
    }
}

function updateChildren(el, oldChildren, newChildren) {
    //两个都有儿子的处理方法 vue2中采用的双指针的方法
    let oldStartIndex = 0;
    let newStrartIndex = 0;
    let oldEndIndex = oldChildren.length - 1;
    let newEndIndex = newChildren.length - 1;

    let oldStartVnode = oldChildren[0];
    let newStartVnode = newChildren[0];

    let oldEndVnode = oldChildren[oldEndIndex];
    let newEndVnode = newChildren[newEndIndex];

    function makeIndexBykey(children) { //将所有老节点的key 拿出来 做映射表
        let map = {}
        children.forEach((child, index) => {
            map[child.key] = index;
        })
        return map;
    }

    let map = makeIndexBykey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStrartIndex <= newEndIndex) { //双方有 头指针 大于尾指针则停止循环
        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
        }

        //比较头指针是否相同
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode); //如果是相同的节点 递归调用
            oldStartVnode = oldChildren[++oldStartIndex]; //老的头指针向后移动
            newStartVnode = newChildren[++newStrartIndex];//新的头指针向后移动
        }
        //比较尾指针的 是否相同
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode); //如果是相同的节点 递归调用
            oldEndVnode = oldChildren[--oldEndIndex]; //老的尾指针向后移动
            newEndVnode = newChildren[--newEndIndex];//新的尾指针向后移动
        }
        //交叉比对 头尾相比 老的尾和新的头
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode);
            el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将老的尾巴移动到前面去
            oldEndVnode = oldChildren[--oldEndIndex];
            newStartVnode = newChildren[++newStrartIndex];
        }
        //交叉比对 头尾相比 老的头和新的尾
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode);
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //老的头 移动到老的最后一个位置
            oldStartVnode = oldChildren[++oldStartIndex];
            newEndVnode = newChildren[--newEndIndex];
        }
        //乱序对比
        //根据老的列表做一个映射关系 用新的去找 找到相同的就移动 找不到就增加 最后删除多余的
        else {
            let moveIndex = map[newStartVnode.key];  //如果拿到 则说明是需要移动的索引
            if (moveIndex !== undefined) { //查看老节点中 是否存在新节点
                let moveVnode = oldChildren[moveIndex]; //找到对应的虚拟节点 复用
                el.insertBefore(oldStartVnode.el, moveVnode.el); //移动真实Dom到指定位置
                oldChildren[moveIndex] = undefined; //表示这个节点已经移动走了
                patchVnode(moveVnode, newStartVnode); //比较两个节点的 属性和子节点
            } else { //在老的节点中找不到 新节点对应的节点
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el); //则创建新节点 并插入到当前指针最前面 
            }

            newStartVnode = newChildren[++newStrartIndex];
        }

    }
    if (newStrartIndex <= newEndIndex) { //新的指针多了 将多的指针插入
        for (let i = newStrartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i]);
            //这里可能是向后追加 也有可以向后追加
            let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; //获取下一个元素
            el.insertBefore(childEl, anchor); //anchor为null时 默认为appendChild
        }
    }

    if (oldStartIndex <= oldEndIndex) { //老的指针多了 将老指针多余的删除
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldChildren[i]) {
                let childEl = oldChildren[i].el;
                el.removeChild(childEl);
            }
        }

    }

}