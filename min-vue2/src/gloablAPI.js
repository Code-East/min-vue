import { mergeOptions } from "./utils";

export function initGlobalAPI(Vue) {
    //静态方法
    Vue.options = {
        _base: Vue
    }

    Vue.mixin = function (mixin) {
        //我们希望将用户的选项和去哪聚的options进行合并
        this.options = mergeOptions(Vue.options, mixin)
        return this;
    }

    Vue.extend = function (options) { //穿件组件的方法
        //根据用户的参数 返回一个构造函数

        function Sub(options = {}) { //最终使用的构造函数
            this._init(options); //初始化参数
        }
        Sub.prototype = Object.create(Vue.prototype)
        Sub.prototype.constructor = Sub;
        //希望将用户创建组件传递的参数 和全局的Vue.options来合并
        Sub.options = mergeOptions(Vue.options, options); //保存用户传递的选项
        return Sub;
    }

    Vue.options.components = {}; //全局的指令 Vue.options.directives
    Vue.component = function (id, definition) {
        //如果的覅南通已经是一个函数 说明用户自己调用了Vue.extend
        typeof definition === 'function' ? definition : Vue.extend(definition);
        Vue.options.components[id] = definition
    }
}