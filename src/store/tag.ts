import { defineStore } from 'pinia'
import { StoreTag } from 'api/StoreTag'
import { StoreTagViewModel } from 'model'

export const useTagStore = defineStore('tag', () => {
  const tagList = ref<StoreTagViewModel[]>([])
  const storeTagApi = new StoreTag()
  let loading = false

  function getTagList(refresh?: boolean) {
    if ((refresh || !tagList.value.length) && !loading) {
      loading = true
      return storeTagApi
        .getStoreTagList({})
        .then(res => {
          if (res.data?.tagsData) tagList.value = res.data.tagsData
          return tagList
        })
        .finally(() => (loading = false))
    }
    return Promise.resolve(tagList)
  }
  return {
    tagList,
    getTagList
  }
})
