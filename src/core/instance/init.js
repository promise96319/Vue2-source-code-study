/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // * 1.合并options
    // * options._isComponent 是在 patch 阶段检测到是 component 的时候赋值的
    // * 此时正在实例化子组件
    if (options && options._isComponent) {
      // todo 为什么这种方式会变快？为什么组件需要单独处理？
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }

    // * 2.通过render的代理，对render函数中的一些变量进行检测，看是否合法
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

// * 子组件初始化
// todo 为什么这种方式会变快？
export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // * Vue 构造函数的 options
  // * const options: InternalComponentOptions = {
  // *   _isComponent: true,
  // *   _parentVnode: vnode,
  // *   parent
  // * }
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  // * _parentVnode 为父组件的 vnode
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  // * 组件传值
  opts.propsData = vnodeComponentOptions.propsData
  // * 父 vnode 监听的事件
  opts._parentListeners = vnodeComponentOptions.listeners
  // * _renderChildren 是插槽内部的节点
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

// * 返回构造函数的 options
export function resolveConstructorOptions (Ctor: Class<Component>) {
  // * 如果不是继承，options 就是原构造函数的 options
  // * 如果是继承时，options 为合并 superOptions 和 extendOptions 的 options
  let options = Ctor.options
  // * Ctor.super 存在说明是调用了 extend 方法进行继承生成的构造函数
  // * 详见 /src/core/global-api/extend.js 文件
  // * - superOptions 是父类 options
  // * - extendOptions 是当前类传入的 options (如果与 sealedOptions不同，需要合并)
  // * - options = mergeOptions(superOptions, extendOptions)
  // * - sealedOptions 保存的是当前类继承时 合并后的 options(是extend的时候赋值的)
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    // * 如果 superOptions 变动了，需要处理新的 options
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // * sealedOptions 是 seal 的时候赋值的，
      // * 这里的变动可能是 options 在 extend 后继续被赋值
      // * 复现：https://jsfiddle.net/vvxLyLvq/2/
      // * 所以需要找出变动了的属性，然后更新到 extendOptions 上
      // * 这里的 extend 只是对象的合并
      /**
       * function Vue {}
       * Vue.superOptions
       * Vue.
       */
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      // * 由于 options 变化了，重新合并一次
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        // * 将自身的构造函数也存在了 components 对象中
        // todo 为什么要这么做？
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

// * 比较变化前和变化后的 options 之间的差别
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
