const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); //匹配到分组是一个标签名 <div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); //匹配到的分组是 结束标签的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; //匹配属性 如：style=""
//第一个组就是属性名key 值value就可能 是分组3/4/5

const statrTagClose = /^\s*(\/?)>/; //开始标签的结束 可能是> 也可能是 / 如：<div>结束为 > <br/>结束为 /
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; //{{ }} 匹配到的内容就是表达式的变量 

//对模板进行编译处理
export function parseHTML(html) {

    const ELEMENT_TYPE = 1; //元素类型
    const TEXT_TYPE = 3; //文本类型
    const stack = []; //用于存放元素的栈
    let currentParent; //指向栈中的最后一个
    let root; //根节点

    function createASTElement(tag, attrs){ //创造ast节点方法
        return{
            tag,
            type:ELEMENT_TYPE,
            children:[],
            attrs,
            parent:null
        }
    }
    //利用线型结构 来构造一个数
    function start(tag,attrs){
        let node = createASTElement(tag,attrs); //创造一个ast节点
        if (!root) { //判断是否存在根节点
            root = node; //不存在则当前节点为根节点
        }
        if (currentParent) { //如果当前存在节点
            node.parent = currentParent;  //则将新创建的节点的parent指向它
            currentParent.children.push(node); //将currentParent的children指向
        }
        stack.push(node); //存入栈中
        currentParent = node; //currentParent为栈中的最后一个
    }
    function chars(text){ //是文本直接放入 当前指向的节点中
        text = text.replace(/\s/g,'');
        text && currentParent.children.push({
            type:TEXT_TYPE,
            text,
            parent:currentParent
        });

    }
    function end(tag){ //查询为结束节点
        let node = stack.pop(); //弹出最后一个节点
        currentParent = stack[stack.length - 1]; //重新给定节点
    }

    function advance(n) { //截取 删除字符串
        html = html.substring(n);
    }
    function parseStartTag() { //获取出开始标签 和标签属性
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1], //标签名
                attrs: []
            }
            advance(start[0].length);

            //如果不是开始标签的结束 就一直匹配
            let attr, end;
            while (!(end = html.match(statrTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length);
                match.attrs.push({name:attr[1],value:attr[3] || attr[4] || attr[5] || true}); //获取属性和属性值 存入match

            }
            if (end) {
                advance(end[0].length);
            }
            return match;
        }

        return false; //不是开始标签
    }
    while (html) {
        //如果textEnd 为0 则说明是一个开始标签或者结束标签
        //如果textEnd > 0 则说明就是文本的结束位置
        let textEnd = html.indexOf('<');

        if (textEnd == 0) {
            const startTagMatch = parseStartTag(); //开始标签的匹配结果
            if (startTagMatch) {
                start(startTagMatch.tagName,startTagMatch.attrs);
                continue;
            }
            let endTagMatch = html.match(endTag);
            if (endTagMatch) {
                end(endTagMatch[1]);
                advance(endTagMatch[0].length);
                continue;
            }
        }
        if (textEnd > 0) {
            let text = html.substring(0,textEnd); //文本内容
            if (text) {
                chars(text);
                advance(text.length); //解析到的文本
            }
        }
    }
    
    return root;
}