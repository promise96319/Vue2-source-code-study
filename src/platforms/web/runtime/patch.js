/* @flow */
// * nodeOps 处理 node 节点
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
// * baseModules 一些基本的处理函数，包含 create update 方法
// * 主要处理 attrs / class / dom-props / style / transition
const modules = platformModules.concat(baseModules)

export const patch: Function = createPatchFunction({ nodeOps, modules })
