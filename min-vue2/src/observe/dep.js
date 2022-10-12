
let id = 0;
class Dep {
    constructor() {
        this.id = id++;
        this.subs = []; //这里存放这当前属性对应的watcher有哪些
    }
    depend() {
        //我们不希望放入重复的watcher 且dep和watcher是双向的
        //Dep.target是一个watcher
        Dep.target.addDep(this); //让watcher记住当前dep
    }
    addSub(watcher) { //存入对应的watcher
        this.subs.push(watcher);
    }
    notify() {
        this.subs.forEach(watcher => watcher.updata());//告诉所有用到该属性的watcher去更新页面
    }
}
Dep.target = null; //在类上挂载静态属性 静态属性只有一个 使用类名.的方法来访问

let stack = [];
export function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
}
export function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
}

export default Dep;