import { patchAttr } from "./modules/attr";
import { patchClass } from "./modules/class";
import { patchEvent } from "./modules/event";
import { patchStyle } from "./modules/style";

//dom属性的操作api
export function patchProp(el, key, prevValue, nextValue) {
    //类名el.className
    if (key === 'class') {
        patchClass(el, nextValue);
    } else if (key === 'style') { //样式el.style
        patchStyle(el, prevValue, nextValue);
    } else if (/^on[^a-z]/.test(key)) { //events事件
        patchEvent(el, key, nextValue);
    } else {  //普通属性
        patchAttr(el, key, nextValue);
    }




   
}