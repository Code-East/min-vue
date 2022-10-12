import { compileToFunction } from "./compiler/index";
import { initGlobalAPI } from "./gloablAPI";
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
function Vue(options) { //options就是用户的选项
    this._init(options); //_init方法在innitMixin中 绑定到了Vue.prototype上了
}


initMixin(Vue); //调用初始化
initLifeCycle(Vue); //实现了 vm_update 和 vm._render
initGlobalAPI(Vue); //全局api的实现
initStateMixin(Vue); //实现了nextTick 和 $watch


export default Vue