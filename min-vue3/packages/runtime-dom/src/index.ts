import { createRenderer,h } from '@vue/runtime-core';
import { nodeOps } from './nodeOps'
import { patchProp } from './pathProp'

const renderOptions = Object.assign(nodeOps, { patchProp });

export function render(vnode, container){
    createRenderer(renderOptions).render(vnode, container);
}
export { h }