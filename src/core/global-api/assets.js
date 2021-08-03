/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        // 如果是函数形式组件，则不需要进行继承处理 - 异步组件
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          // * 通过继承，返回新的构造函数（相当于 子组件 的构造函数）
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          // * 指令的定义
          definition = { bind: definition, update: definition }
        }
        // * component / directive / filter 
        // * 将注册的内容全部添加到 Vue 构造函数的 options 上
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}
