import { compileToFunction } from "./compiler/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state"
import { mergeOptions } from "./utils";
export function initMixin(Vue){ //vue初始化配置方法 放入Vue的原型对象
    
    //初始化响应式数据
    Vue.prototype._init = function(options){
        //vue中有 vm.$options = options 就是用户传入的配置项 包含data watch methods等
        const vm = this; //将this保存为vm
        vm.$options = mergeOptions(this.constructor.options,options); //将用户传入的options挂载到实例上
        callHook(vm,'beforeCreate')
        //初始化状态
        initState(vm);
        callHook(vm,'created')

        if (options.el) { //判断是否存在el属性
            vm.$mount(options.el);
        }
    }

    //初始化挂载DOM
    Vue.prototype.$mount = function(el){
        const vm = this; //将this保存为vm
        el = document.querySelector(el); //在页面中找到当前Dom元素
        
        let ops = vm.$options;
        if (!ops.render) { //先进行查找有没有render函数
            let template; //没有render看一下是否写了tempate 没写template采用外部的template
            if (!ops.template && el) { //没有写模板 但写了el
                template = el.outerHTML
            }else{ //有template
                if (el) {
                    template = ops.template; //有template和el 则采用模板内容
                }
            }
            //写了template就用写了的template
            if(template){
                //这里需要对模板进行编译
                const render = compileToFunction(template);
                ops.render = render;
            }
        }

       mountComponent(vm,el) //挂载方法
    }

}
