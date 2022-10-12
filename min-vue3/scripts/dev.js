const args = require('minimist')(process.argv.slice(2));
const { resolve } = require('path');
const { build } = require('esbuild')

const target = args._[0] || "reactivity";
const format = args.f || 'global';

const pkg = require(resolve(__dirname,`../packages/${target}/package.json`));

const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm';

const outfile = resolve(__dirname,`../packages/${target}/dist/${target}.${format}.js`)

build({
    entryPoints: [resolve(__dirname,`../packages/${target}/src/index.ts`)],
    outfile,
    bundle: true, //把所有的包全部打包在一起
    sourcemap: true,
    format: outputFormat,
    globalName:pkg.buildOptions?.name,
    platform: format === 'cjs' ? 'node' : 'browser',
    watch:{ //1监控文件变化
        onRebuild(error) {
            if (!error) console.log("rebuilt~~" )
        }
    }
    }).then(() => {
        console.log("watching---");
    })