(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); //匹配到分组是一个标签名 <div>

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); //匹配到的分组是 结束标签的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性 如：style=""
  //第一个组就是属性名key 值value就可能 是分组3/4/5

  var statrTagClose = /^\s*(\/?)>/; //开始标签的结束 可能是> 也可能是 / 如：<div>结束为 > <br/>结束为 /
  //对模板进行编译处理

  function parseHTML(html) {
    var ELEMENT_TYPE = 1; //元素类型

    var TEXT_TYPE = 3; //文本类型

    var stack = []; //用于存放元素的栈

    var currentParent; //指向栈中的最后一个

    var root; //根节点

    function createASTElement(tag, attrs) {
      //创造ast节点方法
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    } //利用线型结构 来构造一个数


    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); //创造一个ast节点

      if (!root) {
        //判断是否存在根节点
        root = node; //不存在则当前节点为根节点
      }

      if (currentParent) {
        //如果当前存在节点
        node.parent = currentParent; //则将新创建的节点的parent指向它

        currentParent.children.push(node); //将currentParent的children指向
      }

      stack.push(node); //存入栈中

      currentParent = node; //currentParent为栈中的最后一个
    }

    function chars(text) {
      //是文本直接放入 当前指向的节点中
      text = text.replace(/\s/g, '');
      text && currentParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: currentParent
      });
    }

    function end(tag) {
      //查询为结束节点
      stack.pop(); //弹出最后一个节点

      currentParent = stack[stack.length - 1]; //重新给定节点
    }

    function advance(n) {
      //截取 删除字符串
      html = html.substring(n);
    }

    function parseStartTag() {
      //获取出开始标签 和标签属性
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          //标签名
          attrs: []
        };
        advance(start[0].length); //如果不是开始标签的结束 就一直匹配

        var attr, _end;

        while (!(_end = html.match(statrTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          }); //获取属性和属性值 存入match
        }

        if (_end) {
          advance(_end[0].length);
        }

        return match;
      }

      return false; //不是开始标签
    }

    while (html) {
      //如果textEnd 为0 则说明是一个开始标签或者结束标签
      //如果textEnd > 0 则说明就是文本的结束位置
      var textEnd = html.indexOf('<');

      if (textEnd == 0) {
        var startTagMatch = parseStartTag(); //开始标签的匹配结果

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); //文本内容

        if (text) {
          chars(text);
          advance(text.length); //解析到的文本
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = '';

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          //如果是style 则color:red变为{color:red}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); //拼接属性以{name:value}的形式
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{ }} 匹配到的内容就是表达式的变量 

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      //文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0;
        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; //匹配的位置

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(children) {
    return children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',\n            ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null', "\n            ").concat(ast.children.length ? ",".concat(children) : '', "\n        )");
    return code;
  }

  function compileToFunction(template) {
    // 1.将template转化为为ast语法树
    var ast = parseHTML(template); // 2.生成render方法（render方法执行后返回的结构就是虚拟DOM）
    //模板引擎的实现原理 就是 with + new Function

    var code = codegen(ast); //生成 ‘_c{_c('div',{id:app},null),_v(_s(age))}’ 的字符串

    code = "with(this){return ".concat(code, "}");
    var render = new Function(code); //根据代码生成render函数

    return render;
  }

  var strats = {};
  var LIFECTCLE = ['beforeCreate', 'created'];
  LIFECTCLE.forEach(function (hook) {
    strats[hook] = function (p, c) {
      if (c) {
        if (p) {
          return p.concat(c);
        } else {
          return [c];
        }
      } else {
        return p;
      }
    };
  });

  strats.components = function (parentVal, childVal) {
    var res = Object.create(parentVal);

    if (childVal) {
      for (var key in childVal) {
        //返回的是构造函数 可以拿到父亲原型上的属性 并将儿子身上的属性都拷贝到自身
        res[key] = childVal[key];
      }
    }

    return res;
  };

  function mergeOptions(parent, child) {
    var options = {};

    for (var key in parent) {
      mergeField(key);
    }

    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        mergeField(_key);
      }
    }

    function mergeField(key) {
      if (strats[key]) {
        options = strats[key](parent[key], child[key]);
      } else {
        options[key] = child[key] || parent[key];
      }
    }

    return options;
  }

  function initGlobalAPI(Vue) {
    //静态方法
    Vue.options = {
      _base: Vue
    };

    Vue.mixin = function (mixin) {
      //我们希望将用户的选项和去哪聚的options进行合并
      this.options = mergeOptions(Vue.options, mixin);
      return this;
    };

    Vue.extend = function (options) {
      //穿件组件的方法
      //根据用户的参数 返回一个构造函数
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        //最终使用的构造函数
        this._init(options); //初始化参数

      }

      Sub.prototype = Object.create(Vue.prototype);
      Sub.prototype.constructor = Sub; //希望将用户创建组件传递的参数 和全局的Vue.options来合并

      Sub.options = mergeOptions(Vue.options, options); //保存用户传递的选项

      return Sub;
    };

    Vue.options.components = {}; //全局的指令 Vue.options.directives

    Vue.component = function (id, definition) {
      //如果的覅南通已经是一个函数 说明用户自己调用了Vue.extend
      typeof definition === 'function' ? definition : Vue.extend(definition);
      Vue.options.components[id] = definition;
    };
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; //这里存放这当前属性对应的watcher有哪些
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        //我们不希望放入重复的watcher 且dep和watcher是双向的
        //Dep.target是一个watcher
        Dep.target.addDep(this); //让watcher记住当前dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        //存入对应的watcher
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.updata();
        }); //告诉所有用到该属性的watcher去更新页面
      }
    }]);

    return Dep;
  }();

  Dep.target = null; //在类上挂载静态属性 静态属性只有一个 使用类名.的方法来访问

  var stack = [];
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher;
  }
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0; // 1)当我们创建渲染watcher的时候我们会把当前渲染的watcher放到Dep.target上
  // 2）调用_render() 会取值走到get上

  var Watcher = /*#__PURE__*/function () {
    //不同组件有不同的watcher 
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options; //标识是一个渲染的watcher

      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          //getter调用可以发生取值操作
          return vm[exprOrFn];
        };
      } else {
        this.getter = exprOrFn; //getter调用可以发生取值操作
      }

      this.deps = []; //实现计算属性和watch

      this.depsId = new Set();
      this.lazy = options.lazy;
      this.cb = cb;
      this.dirty = this.lazy; //缓存值

      this.value = this.lazy ? undefined : this.get();
      this.user = options.user;
      this.vm = vm;
    }

    _createClass(Watcher, [{
      key: "evaluate",
      value: function evaluate() {
        this.value = this.get(); //获取到computend函数执行的返回值

        this.dirty = false;
      }
    }, {
      key: "get",
      value: function get() {
        pushTarget(this); //把当前的watcher放入Dep的静态属性

        var value = this.getter.call(this.vm); //去vm上取值

        popTarget(); //渲染完成后清空

        return value;
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        //一个组件对应多个属性 重复的属性不用记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          //根据dep的id 去重
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this);
        }
      }
    }, {
      key: "depend",
      value: function depend() {
        var i = this.deps.length;

        while (i--) {
          this.deps[i].depend(); //让计算属性watcher 也收集渲染
        }
      }
    }, {
      key: "updata",
      value: function updata() {
        //更新视图
        if (this.lazy) {
          //如果是计算属性 依赖的值变化可 就标识计算属性为脏值 表示需要重新获取
          this.dirty = true;
        } else {
          queueWatcher(this); //把当前的waycher暂存起来
        } // this.get();

      }
    }, {
      key: "run",
      value: function run() {
        var oldval = this.value;
        var newval = this.get();

        if (this.user) {
          this.cb.call(this.vm, newval, oldval);
        }
      }
    }]);

    return Watcher;
  }();

  var queue = [];
  var has = {};
  var pending = false; //防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    //使用定时器进行防抖
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var callbacks = [];
  var waiting = false;

  function flushCallbasks() {
    var cbs = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cbs.forEach(function (cb) {
      return cb();
    }); //按照顺序依次执行
  }

  function nextTick(cb) {
    callbacks.push(cb); //维护nextTick中的callback方法

    if (!waiting) {
      setTimeout(function () {
        flushCallbasks(); //最后一起刷新
      }, 0);
      waiting = true;
    }
  } //需要给每一个属性增加一个 dep 目的就是收集watcher

  var isReservedTag = function isReservedTag(tag) {
    //判断是否是原始标签
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag);
  };

  function createElementVNode(vm, tag, data) {
    //生成虚拟node方法
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    if (isReservedTag(tag)) {
      //判断是否为正常的html节点
      return vnode(vm, tag, key, data, children);
    } else {
      //不是正常的节点 表示是自定义组件
      debugger;
      var Ctor = vm.$options.components[tag];
      return createComponentVnode(vm, tag, key, data, children, Ctor);
    }
  }

  function createComponentVnode(vm, tag, key, data, children, Ctor) {
    //创建自定义组件的虚拟Dom
    if (_typeof(Ctor) === 'object') {
      vm.$options._base.extend(Ctor);
    }

    data.hook = {
      init: function init(vnode) {
        //稍后创建真实节点的时候 如果是组件则调用init方法
        //保存组件的实例到虚拟节点上
        var instance = vnode.componentInstance = new vnode.componentOptions.Ctor();
        instance.$mount();
      }
    };
    return vnode(vm, tag, key, data, children, null, {
      Ctor: Ctor
    });
  }

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } //ast不一样 ast做的是语法层面的 html长什么样所以要遵守html的规则 不能加自定义属性v-if等
  //虚拟dom是描述dom元素的 可以加自定义属性等 其他功能

  function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text,
      componentOptions: componentOptions
    };
  }

  function isSameVnode() {
    var vnode1 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var vnode2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key;
  }

  function createComponent(vnode) {
    var i = vnode.data;

    if ((i = i.hook) && (i = i.init)) {
      i(vnode); //初始化组件
    }

    if (vnode.componentInstance) {
      return true;
    }
  }

  function createElm(vnode) {
    //创建真实节点方法
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      //标签
      //创建真实元素 主要区分是组件还是元素
      if (createComponent(vnode)) {
        //组件
        return vnode.componentInstance.$el;
      }

      vnode.el = document.createElement(tag); //将真实节点和虚拟节点对应起来 方便后面修改更新

      patchProps(vnode.el, {}, data); //为真实节点加入对应的属性

      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    //老节点的属性中有新节点没有 要删除老的节点
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    for (var key in oldStyles) {
      //老节点有的样式属性
      if (!newStyles[key]) {
        //新节点没有这个样式属性
        el.style[key] = ''; //就删除这个样式属性
      }
    }

    for (var _key in oldProps) {
      //老节点中有的属性
      if (!props[_key]) {
        //新节点没有这个属性
        el.removeAttribute(_key); //删除节点中的这个属性
      }
    } //新节点的属性 老节点没有 就全部替换老节点属性


    for (var _key2 in props) {
      // 用新的属性 替换老的属性
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
      }
    }
  }
  function patch(oldVNode, vnode) {
    if (!oldVNode) {
      //这就是组件的挂载
      return createElm(vnode);
    } //初次渲染流程


    var isRealElement = oldVNode.nodeType; //nodeType是js原生的方法 如果是真实的DOM会返回1

    if (isRealElement) {
      //真实DOM元素
      var elm = oldVNode; //获取到真实DOM元素

      var parentElm = elm.parentNode; //拿到父节点

      var newElm = createElm(vnode); //根据虚拟DOM 创建真实DOM

      parentElm.insertBefore(newElm, elm.nextSibling); //插入新的的DOM 到老的DOM后

      parentElm.removeChild(elm); //再删除原来的节点

      return newElm;
    } else {
      //else的话 表示两个都是虚拟节点 就需要进行diff算法就是更新算法
      //diff算法是平级比较的 父节点和父节点 子节点和子节点对比
      //1.两个节点不是同一个节点 直接删除老的节点换上新的节点(没有对比)
      //2.两个节点是同一个节点(判断节点的tag 和 节点的key) 对比两个节点的属性是否有差异(复用老的及诶单，将差异的属性进行操作)
      //3.节点比较完毕后就需要比较两个节点的子节点了
      return patchVnode(oldVNode, vnode);
    }
  }

  function patchVnode(oldVNode, vnode) {
    //对比更新节点方法
    //1.两个节点不是同一个节点 直接删除老的节点换上新的节点(没有对比)
    if (!isSameVnode(oldVNode, vnode)) {
      //不是相同节点
      //用老节点的父节点 进行替换
      var _el = createElm(vnode);

      oldVNode.el.parentNode.replaceChild(_el, oldVNode.el);
      return _el;
    } //文本的情况 需要对比一下文本的内容


    var el = vnode.el = oldVNode.el; //复用老节点的元素

    if (!oldVNode.tag) {
      //是文本
      if (oldVNode.text !== vnode.text) {
        //两个节点的文本不同
        el.textContent = vnode.text; //用新的覆盖老的文本
      }
    } //是标签 我们需要比较标签的属性


    patchProps(el, oldVNode.data, vnode.data); //比较儿子节点 比较的情况是一方有儿子 一方没儿子 或者 两边都有儿子

    var oldChildren = oldVNode.children || [];
    var newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      //两个人都有儿子
      //完整的diff算法 需要比较两个节点的子节点
      updateChildren(el, oldChildren, newChildren); //子节点还有子节点 就递归调用
    } else if (newChildren.length > 0) {
      //老节点没有子节点 新的有
      mountChildren(el, newChildren); //加入新的子节点到父节点
    } else if (oldChildren.length > 0) {
      //老节点有子节点 新的没有
      el.innerHTML = ''; //删除老的所有子节点
    }

    return el;
  }

  function mountChildren(el, newChildren) {
    //加入新的子节点到父节点
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  function updateChildren(el, oldChildren, newChildren) {
    //两个都有儿子的处理方法 vue2中采用的双指针的方法
    var oldStartIndex = 0;
    var newStrartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    function makeIndexBykey(children) {
      //将所有老节点的key 拿出来 做映射表
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    var map = makeIndexBykey(oldChildren);

    while (oldStartIndex <= oldEndIndex && newStrartIndex <= newEndIndex) {
      //双方有 头指针 大于尾指针则停止循环
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } //比较头指针是否相同
      else if (isSameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode); //如果是相同的节点 递归调用

        oldStartVnode = oldChildren[++oldStartIndex]; //老的头指针向后移动

        newStartVnode = newChildren[++newStrartIndex]; //新的头指针向后移动
      } //比较尾指针的 是否相同
      else if (isSameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode); //如果是相同的节点 递归调用

        oldEndVnode = oldChildren[--oldEndIndex]; //老的尾指针向后移动

        newEndVnode = newChildren[--newEndIndex]; //新的尾指针向后移动
      } //交叉比对 头尾相比 老的尾和新的头
      else if (isSameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el); //将老的尾巴移动到前面去

        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStrartIndex];
      } //交叉比对 头尾相比 老的头和新的尾
      else if (isSameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); //老的头 移动到老的最后一个位置

        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } //乱序对比
      //根据老的列表做一个映射关系 用新的去找 找到相同的就移动 找不到就增加 最后删除多余的
      else {
        var moveIndex = map[newStartVnode.key]; //如果拿到 则说明是需要移动的索引

        if (moveIndex !== undefined) {
          //查看老节点中 是否存在新节点
          var moveVnode = oldChildren[moveIndex]; //找到对应的虚拟节点 复用

          el.insertBefore(oldStartVnode.el, moveVnode.el); //移动真实Dom到指定位置

          oldChildren[moveIndex] = undefined; //表示这个节点已经移动走了

          patchVnode(moveVnode, newStartVnode); //比较两个节点的 属性和子节点
        } else {
          //在老的节点中找不到 新节点对应的节点
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el); //则创建新节点 并插入到当前指针最前面 
        }

        newStartVnode = newChildren[++newStrartIndex];
      }
    }

    if (newStrartIndex <= newEndIndex) {
      //新的指针多了 将多的指针插入
      for (var i = newStrartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]); //这里可能是向后追加 也有可以向后追加

        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; //获取下一个元素

        el.insertBefore(childEl, anchor); //anchor为null时 默认为appendChild
      }
    }

    if (oldStartIndex <= oldEndIndex) {
      //老的指针多了 将老指针多余的删除
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        if (oldChildren[_i]) {
          var _childEl = oldChildren[_i].el;
          el.removeChild(_childEl);
        }
      }
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      //将vnode虚拟DOM转化为真实DOM
      var vm = this;
      var el = vm.$el;
      var prevVnode = vm._vnode;
      vm._vnode = vnode; //把组件第一次产生的虚拟节点保存在_vnode中

      if (prevVnode) {
        //之前渲染过虚拟节点
        vm.$el = patch(prevVnode, vnode);
      } else {
        vm.$el = patch(el, vnode);
      }
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments))); //生成虚拟node方法
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (_typeof(value) !== 'object') return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      var vm = this; //当渲染的时候会去vm实例上取值 我们可以将属性和视图判定在一起

      return vm.$options.render.call(vm); // 通过ast语法转义后生成的render方法 
      //里面会有_c{_c('div',{id:app},null),_v(_s(age))} _c _s _v的各种方法的调用 在上面声明
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; //1.调用render方法产生虚拟节点 虚拟DOM

    var udataComponet = function udataComponet() {
      vm._update(vm._render());
    };

    new Watcher(vm, udataComponet, true); //2.根据虚拟DOM产生真实DOM
    //3.插入到el元素中
  }
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];

    if (handlers) {
      handlers.forEach(function (handlers) {
        return handlers.call(vm);
      });
    }
  }

  //对数组中的部分方法 进行重新
  var oldArrayProto = Array.prototype; //获取数组的原型
  //类似于继承了Array.prototype 这样就可以使用数组的原有的方法 并修改部分的方法

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [//指出所有的变异方法
  'push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice']; //其他的slice 和 concat等不会修改原数组

  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //重新了数组的方法
      //这里的this 指向的是谁调用这个函数就是谁 也就是当前的data
      (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法 函数劫持 切片编程
      //这里需要对新增的值(也就是使用push或者是unshift,splice进行了数组的增加) 再次的进行劫持


      var inserted; //用于保存新增的数据

      var ob = this.__ob__; //这里的this 指向的是谁调用这个函数就是谁 也就是当前的data

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        //判断是否有新增内容
        //对新增的值进行观测
        ob.observeArray(inserted);
      }

      ob.dep.notify(); //数组变化了 通知更新页面

      return;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      //给每个第个对象都增加收集功能
      this.dep = new Dep(); //Object.defineProperty 只能劫持已经存在的属性(vue里为此写了一些api 如$set $delete)

      Object.defineProperty(data, '__ob__', {
        //在当前的data中 放入__ob__属性为当前实例 以供后面使用
        value: this,
        enumerable: false //将__ob__变成不可枚举(循环的时候无法获取)

      });

      if (Array.isArray(data)) {
        //判断当前值是否为数组
        //这里我们可以重新数组中的方法 7个变异方法(可以修改数组本身的的方法)
        data.__proto__ = newArrayProto; //将当前的data的原型链 指向重新了部分数组方法的对象 这样调用push等方法的时候就会先去 __proto__里面找

        this.observeArray(data); //观测数组方法
      } else {
        this.walk(data); //观测属性
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        //循环对象 对属性依次劫持
        //"重新定义"属性
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        //观测数组
        data.forEach(function (item) {
          return observe(item);
        }); //遍历当前的数据 深度的检测数组 可以检测到数组中和对象
      }
    }]);

    return Observer;
  }();

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      current.__ob__ && current.__ob__.dep.depend(); //为数组中的数组 再次进行依赖收集

      if (Array.isArray(current)) {
        dependArray(current); //递归
      }
    }
  }

  function defineReactive(target, key, value) {
    //这里的value被下面的get和set使用 形成闭包 不会被销毁
    var childOb = observe(value); //对所有的对象都进行属性劫持 使得data中的对象被深度检测

    var dep = new Dep(); //每个属性都有一个dep

    Object.defineProperty(target, key, {
      get: function get() {
        //取值的时候 会执行get
        if (Dep.target) {
          dep.depend(); //让这个属性的收集器记住当前的watcher 方法

          if (childOb) {
            childOb.dep.depend();

            if (Array.isArray(value)) {
              //如果是数组
              dependArray(value);
            }
          }
        }

        return value;
      },
      set: function set(newVal) {
        //修改的时候 会执行set
        if (newVal === value) return;
        observe(newVal); //为修改的值 再次进行数据响应式的处理

        value = newVal;
        dep.notify(); //修改了属性 通知watcher更新页面
      }
    });
  }
  function observe(data) {
    //对这个对象 进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return; //只对对象进行劫持
    }

    if (data.__ob__ instanceof Observer) {
      //说明这个对象被代理过了
      return data.__ob__;
    } //如果一个对象被劫持了 那就不需要再被劫持了 判断一个兑现是否被劫持可以增加一个实例 用实例来判断是否被劫持过


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options; //获取到所有的选择

    if (opts.data) {
      //判断是否存在data
      initData(vm); //存在data 就调用初始化data方法
    }

    if (opts.computed) {
      //判断是否存在computed
      initComputed(vm); //存在就初始化computed
    }

    if (opts.watch) {
      initWatch(vm);
    }
  }

  function proxy(vm, target, key) {
    //vm是实例 target是 _data key是_data中的属性
    //为vm判断 _data中的所有属性 并是响应式的 使其可以使用 this.key 来访问data中的属性
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        if (vm[target][key] === newVal) return;
        vm[target][key] = newVal;
      }
    });
  } //初始化data配置项


  function initData(vm) {
    var data = vm.$options.data; //取出data data可能是对象 可能是函数

    data = typeof data === 'function' ? data.call(vm) : data; //判断是否是函数 是函数使用call执行函数返回对象 不是直接接收 

    vm._data = data; //将data放入vm实例的_data中
    //对数据进行劫持 vue2里采用的是 defineProperty

    observe(data); //将vm._data用vm来代理 从而使用 this.keys 来直接获取和修改data中的值

    for (var key in data) {
      //循环代理里面所有的属性
      proxy(vm, '_data', key);
    }
  }

  function initComputed(vm) {
    var computed = vm.$options.computed; //将计算属性的watcher保存到vm上

    var watchers = vm._computedWatchers = {};

    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === 'function' ? userDef : userDef.get; //创建一个watcher 并且传入计算属性的表示lazy 将属性与watcher对应起来

      watchers[key] = new Watcher(vm, fn, {
        lazy: true
      });
      defineComputed(vm, key, userDef);
    }
  }

  function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get;
    var setter = userDef.set || function () {}; //将计算属性变为属性加入vm实例中 就可以this.获取


    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  } //计算属性不会收集依赖 只会让自己依赖的属性取收集依赖


  function createComputedGetter(key) {
    //需要检测是否需要执行这个getter
    return function () {
      var watcher = this._computedWatchers[key]; //获取到对应属性的watcher

      if (watcher.dirty) {
        //如果是脏的就去执行用户传入的函数
        watcher.evaluate(); //求值后变为false 下次就不求值了
      }

      if (Dep.target) {
        //计算属性出栈后 爱要渲染watcher 应该让计算属性的watcher里面的属性 也去收集上一层的渲染watcher
        watcher.depend();
      }

      return watcher.value; //最后返回的是watcher上的值
    };
  } //初始化watch


  function initWatch(vm) {
    var watch = vm.$options.watch;

    for (var key in watch) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        //判断watch是否为数组形式
        for (var i = 0; i < array.length; i++) {
          createWactch(vm, key, handler[i]);
        }
      } else {
        createWactch(vm, key, handler);
      }
    }
  }

  function createWactch(vm, key, handler) {
    //字符串或者是函数
    if (typeof handler === 'string') {
      handler = vm[handler];
    }

    return vm.$watch(key, handler);
  }

  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick; //最终调用的都是这个api

    Vue.prototype.$watch = function (exprOrFn, cb) {
      //当watcher里面依赖的值变化了 就直接执行cb 回调函数
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
  }

  function initMixin(Vue) {
    //vue初始化配置方法 放入Vue的原型对象
    //初始化响应式数据
    Vue.prototype._init = function (options) {
      //vue中有 vm.$options = options 就是用户传入的配置项 包含data watch methods等
      var vm = this; //将this保存为vm

      vm.$options = mergeOptions(this.constructor.options, options); //将用户传入的options挂载到实例上

      callHook(vm, 'beforeCreate'); //初始化状态

      initState(vm);
      callHook(vm, 'created');

      if (options.el) {
        //判断是否存在el属性
        vm.$mount(options.el);
      }
    }; //初始化挂载DOM


    Vue.prototype.$mount = function (el) {
      var vm = this; //将this保存为vm

      el = document.querySelector(el); //在页面中找到当前Dom元素

      var ops = vm.$options;

      if (!ops.render) {
        //先进行查找有没有render函数
        var template; //没有render看一下是否写了tempate 没写template采用外部的template

        if (!ops.template && el) {
          //没有写模板 但写了el
          template = el.outerHTML;
        } else {
          //有template
          if (el) {
            template = ops.template; //有template和el 则采用模板内容
          }
        } //写了template就用写了的template


        if (template) {
          //这里需要对模板进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
      }

      mountComponent(vm, el); //挂载方法
    };
  }

  function Vue(options) {
    //options就是用户的选项
    this._init(options); //_init方法在innitMixin中 绑定到了Vue.prototype上了

  }

  initMixin(Vue); //调用初始化

  initLifeCycle(Vue); //实现了 vm_update 和 vm._render

  initGlobalAPI(Vue); //全局api的实现

  initStateMixin(Vue); //实现了nextTick 和 $watch

  return Vue;

}));
