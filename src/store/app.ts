import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const user = reactive({})

  return {
    user
  }
})
