/* @flow */

const validDivisionCharRE = /[\w).+\-_$\]]/

// * 解析 filters 表达式，如 {{ expression | filterFunction }}
export function parseFilters (exp: string): string {
  // * 是否在单引号内
  let inSingle = false
  // * 是否在双引号内
  let inDouble = false
  // * 是否在模板字符串内
  let inTemplateString = false
  // * 是否在正则表达式内
  let inRegex = false
  // * 左大括号数量 - 右大括号数量
  let curly = 0
  // * 左中括号数量 - 右中括号数量
  let square = 0
  // * 左小括号数量 - 右小括号数量
  let paren = 0
  let lastFilterIndex = 0
  let c, prev, i, expression, filters

  // * String.fromCharCode(targetNum) 进行解码
  // * 0x5c => \\
  // * 0x2f => /
  // * 0x7c => |
  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {
      if (c === 0x27 && prev !== 0x5C) inSingle = false
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false
    } else if (
      c === 0x7C && // pipe
      exp.charCodeAt(i + 1) !== 0x7C &&
      exp.charCodeAt(i - 1) !== 0x7C &&
      !curly && !square && !paren
    ) {
      // * 前面不存在任何括号时，| 被看作是过滤
      // * 如果没有表达式，那么前面的部分就是表达式
      if (expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()
      } else {
      // * 如果有表达式，那么将 filter 内容加入到队列中（管道）
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break         // "
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /
        let j = i - 1
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {
          p = exp.charAt(j)
          if (p !== ' ') break
        }
        if (!p || !validDivisionCharRE.test(p)) {
          inRegex = true
        }
      }
    }
  }

  // * 没有表达式，说明没有遇到filter
  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
  // * 如果不为0，说明遇到过filter，将 | 最后的一部分作为filter
    pushFilter()
  }

  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  if (filters) {
    for (i = 0; i < filters.length; i++) {
      expression = wrapFilter(expression, filters[i])
    }
  }

  return expression
}

// * 包装 filter方法，得出最终表达式
function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(')
  if (i < 0) {
    // _f: resolveFilter
    return `_f("${filter}")(${exp})`
  } else {
    // * 有过滤参数时执行以下代码
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1)
    return `_f("${name}")(${exp}${args !== ')' ? ',' + args : args}`
  }
}
