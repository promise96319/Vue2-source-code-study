/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
//* options 和 compile 都是可替换的 - alternative
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  /**
   * * 生成 ast 树 🌲
   * {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        rawAttrsMap: {},
        parent,
        children: [],
        ...属性扩展开来
      }
   */
  const ast = parse(template.trim(), options)
  if (options.optimize !== false) {
    // * 标记节点是否为 static (避免重复渲染)
    optimize(ast, options)
  }
  // * 代码生成（render 函数：可以生成 vnode 树的代码）
  const code = generate(ast, options)

  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})
