/** 是否显示(保留占位) */
export const vVisible = {
  created: (el: HTMLImageElement, binding: any) => {
    el.style.visibility = binding.value ? 'visible' : 'hidden'
  }
}

/** 图片加载完毕再显示 */
export const vReady = {
  created: (el: HTMLImageElement) => {
    el.style.visibility = 'hidden'
  },
  mounted: (el: HTMLImageElement) => {
    el.onload = () => (el.style.visibility = 'visible')
  }
}
