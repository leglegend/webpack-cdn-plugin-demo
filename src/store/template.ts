import { defineStore } from 'pinia'
import { Message } from 'api/Message'
import { WorkWeChatMsgTemplateViewModel } from 'model'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<WorkWeChatMsgTemplateViewModel[]>([])
  const messageApi = new Message()

  function getTemplatesList(refresh?: boolean) {
    if (refresh || !templates.value.length) {
      messageApi.getWorkWeChatMsgTemplates({}).then(res => {
        if (res.data?.templates) templates.value = res.data?.templates
      })
    }
    return templates
  }
  return {
    getTemplatesList
  }
})
