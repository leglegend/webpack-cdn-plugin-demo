import { defineStore, createPinia } from 'pinia'
import { Store } from 'api/Store'
import { BusinessGetStoreInfoResponseViewModel } from 'model'

export const useStore = defineStore('store', () => {
  const storeApi = new Store()
  const storeInfo = ref<BusinessGetStoreInfoResponseViewModel>()
  let loading = false
  function getStoreInfo(refresh?: boolean) {
    if ((refresh || !storeInfo.value) && !loading) {
      loading = true
      storeApi
        .businessGetStoreInfo({})
        .then(res => {
          if (res.data) storeInfo.value = res.data
        })
        .finally(() => (loading = false))
    }
    return storeInfo
  }
  return {
    getStoreInfo
  }
})

export { useUserStore } from './user'
export { useAppStore } from './app'
export { useTagStore } from './tag'
export { useCardStore } from './card'
export { useConditionStore } from './condition'
export { useTemplateStore } from './template'
export { useEventStore } from './event'
export { useStaffStore } from './staff'
export default createPinia()
