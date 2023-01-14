import { defineStore } from 'pinia'
import { Staff } from 'api/Staff'
import { StaffInfoResponseModel } from 'model'
import type { Ref } from 'vue'

export const useStaffStore = defineStore('staff', () => {
  type RefStaffList = Ref<StaffInfoResponseModel[]>
  const staffList: RefStaffList = ref([])
  const staffApi = new Staff()
  let loading = false

  function getStaffList(refresh?: boolean): Promise<RefStaffList> {
    if ((refresh || !staffList.value.length) && !loading) {
      loading = true
      return staffApi
        .getStaffList({})
        .then(res => {
          if (res.data?.staffs) staffList.value = res.data.staffs
          return staffList
        })
        .finally(() => (loading = false))
    }
    return Promise.resolve(staffList)
  }
  return {
    staffList,
    getStaffList
  }
})
