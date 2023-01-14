import { defineStore } from 'pinia'
import { WorkWeChat } from '@/api/generated/WorkWeChat'
import storageHook from '@/utils/hooks/storage'
import router from '@router'

export const useUserStore = defineStore('user', {
  state() {
    interface UserInfo {
      userId: number
      storeId: number
      token: string
      isBind: boolean
      isFill: boolean
    }
    const workWeChatApi = new WorkWeChat()
    const storage = storageHook()

    const userInfo = ref<UserInfo | null>()
    userInfo.value = storage.getItem<UserInfo | null>('userInfo')

    function getUrlParams(url: string) {
      // 通过 ? 分割获取后面的参数字符串
      const urlStr = url.split('?')[1]
      if (!urlStr) return {}
      // 创建空对象存储参数
      const obj: Record<string, string> = {}
      // 再通过 & 将每一个参数单独分割出来
      const paramsArr = urlStr.split('&')
      for (let i = 0, len = paramsArr.length; i < len; i++) {
        // 再通过 = 将每一个参数分割为 key:value 的形式
        const arr = paramsArr[i].split('=')
        obj[arr[0]] = arr[1]
      }
      return obj
    }

    function weixinLogin(next?: Function) {
      const params = getUrlParams(window.location.href)
      if (params.type === 'login' && params.code) {
        setTimeout(() => {
          workWeChatApi
            .loginUser({
              code: params.code,
              versionNo: '1.0.0'
            })
            .then(res => {
              if (res.data) {
                userInfo.value = {
                  userId: res.data.id!,
                  storeId: res.data.userStores?.[0].storeId || 0,
                  token: res.data.signToken!,
                  isBind: res.data.isBindMobile || false,
                  isFill: res.data.userStores?.[0].isFillInformation || false
                }
                storage.setItem<UserInfo>('userInfo', userInfo.value)
                if (userInfo.value.isBind || userInfo.value.isFill) {
                  router.push('login')
                } else {
                  next && next()
                }
              }
            })
            .catch(() => {
              window.location.href = window.location.origin
            })
        }, 2000)
      } else {
        workWeChatApi.getAuthUrl({ appType: 0 }).then(res => {
          if (res.data?.authUrl) window.location.href = res.data?.authUrl
        })
      }
    }
    return {
      weixinLogin,
      updateBind(isBind: boolean) {
        if (!userInfo.value) return
        userInfo.value.isBind = isBind
        storage.setItem<UserInfo>('userInfo', userInfo.value)
      },
      updateFill(isFill: boolean) {
        if (!userInfo.value) return
        userInfo.value.isFill = isFill
        storage.setItem<UserInfo>('userInfo', userInfo.value)
      },
      clearUserInfo() {
        userInfo.value = null
        storage.removeItem('userInfo')
      },
      userInfo
    }
  }
})
