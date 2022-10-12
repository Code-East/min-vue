//对数组中的部分方法 进行重新

let oldArrayProto = Array.prototype; //获取数组的原型

//类似于继承了Array.prototype 这样就可以使用数组的原有的方法 并修改部分的方法
export let newArrayProto = Object.create(oldArrayProto); 

let methods = [ //指出所有的变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'reverse',
    'sort',
    'splice'
] //其他的slice 和 concat等不会修改原数组

methods.forEach(method => {
    newArrayProto[method] = function(...args){ //重新了数组的方法

        //这里的this 指向的是谁调用这个函数就是谁 也就是当前的data
        oldArrayProto[method].call(this,...args)  //内部调用原来的方法 函数劫持 切片编程
        
        //这里需要对新增的值(也就是使用push或者是unshift,splice进行了数组的增加) 再次的进行劫持
        let inserted; //用于保存新增的数据
        let ob = this.__ob__; //这里的this 指向的是谁调用这个函数就是谁 也就是当前的data
        switch(method){
            case 'push':
            case 'unshift':
                inserted = args;
                break;
            case 'splice':
                inserted = args.slice(2);
                break;
        }
        
        if(inserted){ //判断是否有新增内容
            //对新增的值进行观测
            ob.observeArray(inserted);
        }
        ob.dep.notify(); //数组变化了 通知更新页面
        return ;
    }
})