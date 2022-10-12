import { isArray, isString, ShapeFlags } from "@vue/shared";
export const Text = Symbol('Text'); 
export function isVnode(value){
    return !!(value && value.__v_isVnode); 
}
export function isSameVnode(n1, n2){ //判断两个虚拟节点是否是相同节点 查看标签名和key是否相同
    return (n1.type === n2.type) && (n1.key === n2.key)
}

//虚拟节点有很多:组件，元素，文本等
export function createVnode(type, props, children = null){
    //判断是否为字符串 如果是就标记了元素类型 如div h1等的
    let shapeFlag = isString(type) ? ShapeFlags.ELEMENT : 0;
    const vnode = { //虚拟节点
        type,
        props,
        children,
        el:null, //虚拟接点对应的真实节点
        key:props?.['key'],
        __v_isVnode:true,
        shapeFlag
    } 
    if (children) {
        let type = 0;
        if (isArray(children)) { //判断孩子是否为数组
            type = ShapeFlags.ARRAY_CHILDREN; //标记为数组子节点
        }else{ //不是数组则是字符 或者数字
            children = String(children); //转化为字符串
            type = ShapeFlags.TEXT_CHILDREN; //标记为字符子节点
        }
        vnode.shapeFlag = vnode.shapeFlag | type;
    }
    return vnode;
}