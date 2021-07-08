/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  //* tag 是否是pre
  isPreTag,
  //* 是否是单标签
  isUnaryTag,
  //* 必须使用属性，比如 option 需要 selected
  mustUseProp,
  //* 自闭和标签
  canBeLeftOpenTag,
  //* html / svg 标签
  isReservedTag,
  //* svg / math
  getTagNamespace,
  //* 获取 staticKeys => 'staticClass,staticStyle'
  staticKeys: genStaticKeys(modules)
}
