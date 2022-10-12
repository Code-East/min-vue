import babel from "rollup-plugin-babel"
export default {
    input:"./src/index.js", //入口
    output:{
        file:'./dist/vue.js', //出口
        name:'Vue', //global.vue 会导入vue到
        format:'umd',//esm es6模块  commonjs模块 iffe自执行函数 umd（commonjs amd）
        sourcemp:true
    },
    plugins:[
        babel({
            exclude:"node_modules/**" //排除node_modules所有文件
        })
    ]
}