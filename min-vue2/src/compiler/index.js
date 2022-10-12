import { parseHTML } from "./parse";

function genProps(attrs) {
    let str = '';
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i];
        if (attr.name === 'style') { //如果是style 则color:red变为{color:red}
            let obj = {};

            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':');
                obj[key] = value;
            });

            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},` //拼接属性以{name:value}的形式
    }
    return `{${str.slice(0, -1)}}`;
}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{ }} 匹配到的内容就是表达式的变量 
function gen(node) {
    if (node.type === 1) {
        return codegen(node);
    } else {
        //文本
        let text = node.text;
        if (!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        } else {
            let tokens = [];
            let match;
            defaultTagRE.lastIndex = 0;
            let lastIndex = 0;
            while (match = defaultTagRE.exec(text)) {
                let index = match.index; //匹配的位置
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)));
                }
                tokens.push(`_s(${match[1].trim()})`)
                lastIndex = index + match[0].length
            }
            if (lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

function genChildren(children) {
    return children.map(child => gen(child)).join(',');
}

function codegen(ast) {
    let children = genChildren(ast.children)
    let code = (`_c('${ast.tag}',
            ${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}
            ${ast.children.length ? `,${children}` : ''}
        )`)
    return code;
}

export function compileToFunction(template) {
    // 1.将template转化为为ast语法树
    let ast = parseHTML(template);

    // 2.生成render方法（render方法执行后返回的结构就是虚拟DOM）

    //模板引擎的实现原理 就是 with + new Function
    let code = codegen(ast); //生成 ‘_c{_c('div',{id:app},null),_v(_s(age))}’ 的字符串
    code = `with(this){return ${code}}`
    let render = new Function(code); //根据代码生成render函数
    return render;
}