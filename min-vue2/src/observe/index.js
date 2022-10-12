import { newArrayProto } from "./array";
import Dep from "./dep";

class Observer {
    constructor(data) {

        //给每个第个对象都增加收集功能
        this.dep = new Dep();

        //Object.defineProperty 只能劫持已经存在的属性(vue里为此写了一些api 如$set $delete)
        Object.defineProperty(data, '__ob__', { //在当前的data中 放入__ob__属性为当前实例 以供后面使用
            value: this,
            enumerable: false //将__ob__变成不可枚举(循环的时候无法获取)
        })
        if (Array.isArray(data)) { //判断当前值是否为数组
            //这里我们可以重新数组中的方法 7个变异方法(可以修改数组本身的的方法)
            data.__proto__ = newArrayProto; //将当前的data的原型链 指向重新了部分数组方法的对象 这样调用push等方法的时候就会先去 __proto__里面找
            this.observeArray(data); //观测数组方法
        } else {
            this.walk(data); //观测属性
        }

    }
    walk(data) { //循环对象 对属性依次劫持
        //"重新定义"属性
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]));
    }
    observeArray(data) { //观测数组
        data.forEach(item => observe(item));  //遍历当前的数据 深度的检测数组 可以检测到数组中和对象
    }
}

function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i];
        current.__ob__ && current.__ob__.dep.depend(); //为数组中的数组 再次进行依赖收集
        if (Array.isArray(current)) {
            dependArray(current); //递归
        }
    }
}

export function defineReactive(target, key, value) { //这里的value被下面的get和set使用 形成闭包 不会被销毁
    let childOb = observe(value); //对所有的对象都进行属性劫持 使得data中的对象被深度检测
    let dep = new Dep(); //每个属性都有一个dep
    Object.defineProperty(target, key, {
        get() { //取值的时候 会执行get
            if (Dep.target) {
                dep.depend(); //让这个属性的收集器记住当前的watcher 方法
                if (childOb) {
                    childOb.dep.depend();
                    if (Array.isArray(value)) { //如果是数组
                        dependArray(value);
                    }
                }
            }
            return value
        },
        set(newVal) {//修改的时候 会执行set
            if (newVal === value) return;
            observe(newVal); //为修改的值 再次进行数据响应式的处理
            value = newVal;
            dep.notify(); //修改了属性 通知watcher更新页面
        }
    })
}

export function observe(data) {
    //对这个对象 进行劫持
    if (typeof data !== 'object' || data == null) {
        return; //只对对象进行劫持
    }
    if (data.__ob__ instanceof Observer) { //说明这个对象被代理过了
        return data.__ob__;
    }
    //如果一个对象被劫持了 那就不需要再被劫持了 判断一个兑现是否被劫持可以增加一个实例 用实例来判断是否被劫持过
    return new Observer(data);
}