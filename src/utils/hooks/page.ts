import { ref, watch } from 'vue'

/**
 *
 * @param immediate 注册hook时立即调用添加的事件
 * @returns {
 *  currentPage: 当前页
 *  pageSize: 每页条数
 *  total: 总数
 * }
 */
function pageHook(immediate?: boolean) {
  const currentPage = ref(1)
  const pageSize = ref(10)
  const total = ref(0)
  const events: Function[] = []

  watch(currentPage, () => {
    events.forEach(event => event())
  })

  function onSizeChange(size: number, callback: (size: number) => void) {
    pageSize.value = size
    callback(size)
  }
  function onCurrentChange(current: number, callback: (current: number) => void) {
    currentPage.value = current
    callback(current)
  }
  function addCurrentChangeEvent(event: Function) {
    if (immediate) event()
    events.push(event)
  }
  return {
    currentPage,
    pageSize,
    total,
    onSizeChange,
    onCurrentChange,
    addCurrentChangeEvent
  }
}

export default pageHook
