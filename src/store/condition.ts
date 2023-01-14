import { User } from 'api/User'
import { GetUserSearchConditionListResponseModel } from 'model'

export const useConditionStore = defineStore('condition', () => {
  const conditionList = shallowRef<GetUserSearchConditionListResponseModel[]>([])

  const userApi = new User()
  function getConditionList(refresh?: boolean) {
    if (refresh || !conditionList.value.length) {
      return userApi.getUserSearchConditionList({ pageSize: 100, pageIndex: 1 }).then(res => {
        if (res.data) conditionList.value = res.data
        return conditionList
      })
    }
    return Promise.resolve(conditionList)
  }
  return {
    conditionList,
    getConditionList
  }
})
