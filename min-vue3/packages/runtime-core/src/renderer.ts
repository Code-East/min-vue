import { isString, ShapeFlags } from "@vue/shared";
import { patchEvent } from "packages/runtime-dom/src/modules/event";
import { createVnode, isSameVnode, Text } from "./vnode";

export function createRenderer(renderOptions) {
    let {
        //增加 删除 修改 查询
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
        setText: hostSetText,
        parentNode: hostParentNode,
        nextSibling: hostNextSibling,
        createElement: hostCreateElement,
        createText: hostCreateText,
        patchProp: hostPatchProp
    } = renderOptions;

    const normalize = (child, i) => {
        if (isString(child[i])) {
            let vnode = createVnode(Text, null, child[i]); //创建虚拟dom
            child[i] = vnode;
        }
        return child[i];
    }

    const mountChildren = (children, container) => {
        for (let i = 0; i < children.length; i++) {
            let child = normalize(children, i);
            patch(null, child, container); //递归 加入自子节点
        }
    }

    const mountElement = (vnode, container, anchor) => {
        let { type, props, children, shapeFlag } = vnode; //取出虚拟dom的属性
        let el = vnode.el = hostCreateElement(type) //创建真实dom 将真实元素 挂载到虚拟节点 用于复用和更新
        if (props) { //判断是否有属性
            for (let key in props) {
                hostPatchProp(el, key, null, props[key]); //挂载属性到真实dom
            }
        }
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) { //判断当前的vnode 是否为文本节点
            hostSetElementText(el, children); //是文本节点 直接放入文本
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { //当前的节点是个数组
            mountChildren(children, el); //则循环遍历数组 递归加入
        }
        hostInsert(el, container, anchor); //将渲染好的节点 加入到页面 app
    }

    const processText = (n1, n2, container) => { //处理文本
        if (n1 === null) { //第一次渲染
            hostInsert((n2.el = hostCreateText(n2.children)), container);
        } else { //存在对应的节点
            const el = n2.el = n1.el; //复用节点
            if (n1.children !== n2.children) {
                hostSetText(el, n2.children); //更新文本内容
            }
        }
    }

    const patchProps = (oldProps, newProps, el) => { //对比属性
        for (let key in newProps) { //如果有新增属性 就直接加上属性
            if (newProps[key] == null) {
                hostPatchProp(el, key, oldProps[key], newProps[key]);
            }
        }
        for (let key in oldProps) { //如果旧节点有 新节点没有 就删除旧属性
            if (newProps[key] == null) {
                hostPatchProp(el, key, oldProps[key], undefined);
            }
        }
    }

    const unmountChildren = (child) => {
        for (let i = 0; i < child.length; i++) {
            unmount(child[i]);
        }
    }

    const patchKeyedChildren = (c1, c2, el) => {
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = c2.length - 1;
        while (i <= e1 && i <= e2) { //从头部一一开始对比
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVnode(n1, n2)) { //看是否是相同节点
                patch(n1, n2, el);
            } else {
                break;
            }
            i++;
        }

        while (i <= e1 && i <= e2) { //从尾部开始一一比较 i不变
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnode(n1, n2)) { //看是否是相同节点
                patch(n1, n2, el);
            } else {
                break;
            }
            e1--;
            e2--;
        }

        //同序列的比较(要么头部相同 要么尾部相同)
        if (i > e1 && i <= e2) {   //如果 i>el 且 i <= e2 表示有新增的
            while (i <= e2) {
                const nxetPos = e2 + 1;
                //根据长度找出下一个元素是否存在 从而判断是在前面新增还是在后面新增
                const anchor = nxetPos < c2.length ? c2[nxetPos].el : null;
                patch(null, c2[i], el, anchor); //创建加入新增的子节点
                i++;
            }
        } else if (i > e2 && i <= e1) { //如果 i>e2 且 i <= e1 表示老节点需要被删除
            while (i <= e1) {
                unmount(c1[i]); //删除旧的子节点
                i++;
            }
        }

        //乱序对比
        let s1 = i;
        let s2 = i;
        const ketToNewIndexMap = new Map();
        for (let i = s2; i <= e2; i++) { //找出新节点中 所有的乱序节点加入map
            ketToNewIndexMap.set(c2[i].key, i);
        }

        //循坏老的元素 看一下新的里面有没有 有就比较差异复用节点 没有就将老的删除 加入新的
        const toBePatched = e2 - s2 + 1; //新元素的个数
        const newIndexToOldIndexMap = new Array(toBePatched).fill(0); //记录是否被对比过的映射表
        for (let i = s1; i <= e1; i++) {
            const oldChild = c1[i]; //老的孩子
            let newIndex = ketToNewIndexMap.get(oldChild.key); //用老的孩子 去新的里面找
            if (newIndex == undefined) { //如果新的中没有
                unmount(oldChild); //就删除老节点
            } else {
                newIndexToOldIndexMap[newIndex - s2] = i + 1; //用于标记path的结果
                patch(oldChild, c2[newIndex], el); //有新的节点就加入
            }
        }

        //移动位置
        for (let i = toBePatched - 1; i >= 0; i--) {
            let index = i + s2;
            let current = c2[index];
            let anchor = index + 1 < c2.length ? c2[index + 1].el : null;
            if (newIndexToOldIndexMap[i] === 0) { //是0表示 还没有patch过 需要对比
                patch(null, current, el, anchor);
            } else { //不是0 说明是已经对比过的属性和儿子
                hostInsert(current.el, el, anchor); //直接插入
            }
        }

    }

    const patchChildren = (n1, n2, el) => { //比较子节点
        //比较两个虚拟节点的儿子的差异
        const c1 = n1 && n1.children;
        const c2 = n2 && n2.children;
        let prevShapeFlag = n1.shapeFlag;
        let shapeFlag = n2.shapeFlag;

        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                //之前的孩子是数组 当前的为文本 就删除所有子节点
                unmountChildren(c1);
            }
            if (c1 !== c2) { //是不同文本
                hostSetElementText(el, c2);
            }
        } else {
            //现在为数组或者为空
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) { //之前为数组
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { //现在也为数组
                    //diff算法
                    patchKeyedChildren(c1, c2, el);
                } else {  //现在不是数组 是为空
                    unmountChildren(c1); //删除之前的所有孩子
                }
            } else {
                if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                    hostSetElementText(el, '');
                }
                if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) { //现在为数组 之前为空
                    mountChildren(c2, el); //挂载所有孩子
                }
            }
        }
    }

    const patchElement = (n1, n2, container) => { //先复用 在比较属性 在比较儿子
        let el = n2.el = n1.el; //复用
        let oldProps = n1.props || {}; //老节点属性
        let newProps = n2.props || {}; //新节点属性

        patchProps(oldProps, newProps, el); //比较属性
        patchChildren(n1, n2, el);
    }

    const processElement = (n1, n2, container, anchor) => { //处理元素
        if (n1 === null) {
            mountElement(n2, container, anchor) //初次渲染 挂载节点
        } else {
            //元素比对
            patchElement(n1, n2, container);
        }
    }

    const patch = (n1, n2, container, anchor = null) => { //核心patch方法
        if (n1 === n2) return; //节点相同
        if (n1 && !isSameVnode(n1, n2)) { //存在老节点 且两个节点不相同
            unmount(n1); //删除老节点
            n1 = null //将老节点清空 这样后续就会认为是新增
        }
        const { type, shapeFlag } = n2;
        switch (type) {
            case Text: //文本类型
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    processElement(n1, n2, container, anchor);
                }
        }
    }

    const unmount = (vnode) => {
        hostRemove(vnode.el);
    }

    //vnode 虚拟dom
    const render = (vnode, container) => {
        if (vnode == null) {
            //卸载逻辑
            if (container._vnode) { //之前确实绚烂过
                unmount(container._vnode);
            }
        } else {
            //这里既有初始化逻辑 又用更新逻辑
            patch(container._vnode || null, vnode, container);
        }
        container._vnode = vnode;
    }
    return {
        render
    }
}