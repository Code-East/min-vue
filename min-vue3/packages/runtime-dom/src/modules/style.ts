export function patchStyle(el, prevValue, nextValue = {}){
    //样式需要比对差异
    for (let key in nextValue) { 
        //用新的值直接覆盖样式
        el.style[key] = nextValue[key];
    }
    if (prevValue) {
        for (let key in prevValue) {
           if (nextValue[key] == null) {
                //老的元素中存在 新的元素中没有 直接清空
                el.style[key] = null;
           }
        }
    }
}