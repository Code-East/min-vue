
export const nodeOps = {
    //对于dom操作的方法 增删改查
    insert(child, parent, anchor = null) { //插入dom元素
        parent.insertBefore(child, anchor); //anchor为null 就相当于appendChild
    },
    remove(child) { //删除节点
        const parentNode = child.parentNode;
        if (parentNode) {
            parentNode.removeChild(child);
        }
    },
    setElementText(el, text) { //设置文本
        el.textContent = text;
    },
    setText(node, text) { //修改文本
        node.nodeValue = text;
    },
    querySelector(selector) { //查找节点
        return document.querySelector(selector);
    },
    parentNode(node) { //查找父节点
        return node.parentNode;
    },
    nextSibling(node) { //查找兄弟节点
        return node.nextSibling;
    },
    createElement(tagName) { //创建节点
        return document.createElement(tagName);
    },
    createText(text) { //创建文本节点
        return document.createTextNode(text)
    }
}