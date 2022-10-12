const strats = {};
const LIFECTCLE = [
    'beforeCreate',
    'created'
]
LIFECTCLE.forEach(hook => {
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
    }

})

strats.components = function (parentVal, childVal) {
    const res = Object.create(parentVal);

    if (childVal) {
        for (let key in childVal) {
            //返回的是构造函数 可以拿到父亲原型上的属性 并将儿子身上的属性都拷贝到自身
            res[key] = childVal[key]; 
        }
    }

    return res;
}

export function mergeOptions(parent, child) {
    let options = {};
    for (let key in parent) {
        mergeField(key);
    }
    for (const key in child) {
        if (!parent.hasOwnProperty(key)) {
            mergeField(key);
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
