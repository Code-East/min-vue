function createInvoker(callback) {
    const invoker = (e) => invoker.value(e);
    invoker.value = callback; //为invoker增加value属性 为最新绑定的函数 在下面是可变的
    return invoker;
}

export function patchEvent(el, eventName, nextValue) {
    let invokers = el._vei || (el._vei = {});
    let exits = invokers[eventName]; //先看有没有缓存过

    if (exits && nextValue) { //已经绑定过这个事件了 如click事件
        exits.value = nextValue; //修改invoker.value属性 替换了最新的函数
    }else{
        //把onClick 变为 click 这种形式
        let event = eventName.sclice(2).toLowerCase();
        if (nextValue) { //传入了最新的函数 
            const invoker = invokers[eventName] = createInvoker(nextValue);
            el.addEventListener(event, invoker); //加入事件和最新的函数到Dom元素上
        }else if (exits) { //如果没有传入绑定的函数 但是之前老的是存在的
            el.removeEventListener(event,exits); //就表明需要清除这个事件
            invokers[eventName] = undefined; //清空缓存在el 中的函数
        }
    }
}