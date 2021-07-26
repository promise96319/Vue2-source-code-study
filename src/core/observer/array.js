/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // cache original method
  // 缓存数组的原始方法
  const original = arrayProto[method]
  def(arrayMethods, method, function mutator (...args) {
    // 调用数组的原始方法
    const result = original.apply(this, args)
    const ob = this.__ob__
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    // 如果是增加了新的元素，那么需要将新增元素也进行响应式处理
    if (inserted) ob.observeArray(inserted)
    // notify change
    // 数组改变了，通知相应 watcher 更新
    ob.dep.notify()
    return result
  })
})

console.log('arrayMethods ==> ', arrayMethods);

