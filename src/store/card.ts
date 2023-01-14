import { defineStore } from 'pinia'
import { StoreCard } from 'api/StoreCard'
import { StorePrepaidCardViewModel } from 'model'

export const useCardStore = defineStore('card', () => {
  const cardList = ref<StorePrepaidCardViewModel[]>([])

  const storeCardApi = new StoreCard()
  function getCardList(refresh?: boolean) {
    if (refresh || !cardList.value.length) {
      storeCardApi.businessGetStorePrepaidCards({}).then(res => {
        if (res.data?.prepaidCards) cardList.value = res.data.prepaidCards
      })
    }
    return cardList
  }

  return {
    cardList,
    getCardList
  }
})
