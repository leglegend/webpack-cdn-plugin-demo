/**
 * @summary 深拷贝对象
 * @param source
 * @returns T
 */
export function deepClone<T>(source: T, map = new Map()): T {
  if (isObject(source)) {
    if (map.get(source)) {
      return map.get(source)
    }

    const target: any = Array.isArray(source) ? [] : {}
    map.set(source, target)

    for (const key in source) {
      target[key] = deepClone(source[key])
    }

    return target as T
  } else {
    return source
  }
}

function isObject(source: any) {
  const type = typeof source
  return source !== null && (type === 'object' || type === 'function')
}

/**
 * @summary 判断两个对象是否相等
 * @param o1
 * @param o2
 * @returns boolean
 */
export function isEqual<T extends Object>(o1: T, o2: T): boolean {
  if (!isObject(o1) || !isObject(o2)) return Object.is(o1, o2)

  const o1keys = Object.keys(o1)
  const o2keys = Object.keys(o2)
  if (o1keys.length !== o2keys.length) return false

  for (const key in o1) {
    if (Object.hasOwn(o2, key)) {
      if (isObject(o1[key]) && isObject(o2[key])) {
        if (!isEqual(o1[key] as Object, o2[key] as Object)) return false
      } else if (Object.is(o1[key], o2[key])) {
        return false
      }
    } else {
      return false
    }
  }

  return true
}
