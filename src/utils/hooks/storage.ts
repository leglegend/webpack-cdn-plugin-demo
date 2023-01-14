const storageHook = () => {
  type key = 'userInfo'
  const storage = window.location.hostname === 'localhost' ? localStorage : sessionStorage
  /**
   * 存储到storage
   */
  function setItem<T>(key: key, item: T) {
    storage.setItem(key, JSON.stringify(item))
  }
  /**
   * 根据key值获取数据
   */
  function getItem<T>(key: key): T | null {
    const item = storage.getItem(key)
    if (!item) return null
    try {
      return JSON.parse(item) as T
    } catch {
      return item as T
    }
  }
  /**
   * 根据key值移除数据
   */
  function removeItem(key: string) {
    storage.removeItem(key)
  }
  return {
    setItem,
    getItem,
    removeItem
  }
}

export default storageHook
