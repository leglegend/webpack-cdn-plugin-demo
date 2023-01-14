<template>
  <div class="member-card">
    <div class="top-bar">
      <div class="title">
        <icon-svg name="warn" color="#0075FF" size="24"></icon-svg>
        自动同步【坚果卡包会员管理系统】商家端的会员卡列表
      </div>
      <el-button round @click="showDialog = true">
        <template #icon>
          <icon-svg name="add" color="#409EFF"></icon-svg>
        </template>
        新建会员卡
      </el-button>
    </div>
    <div class="content">
      <div class="item" v-for="card in cardList" :key="card.prepaidCardId">
        <div class="column">
          <MemberCard :card="card" />
        </div>
        <div class="column">
          <div class="value">{{ card.price ? '¥' + card.price : '免费' }}</div>
          <div class="title">售价</div>
        </div>
        <div class="column">
          <template v-if="card.cardType === 1">
            <div class="value">{{ card.cardValue }} 元</div>
            <div class="title">卡面值</div>
          </template>
          <template v-else-if="card.cardType === 0 || card.cardType === 2">
            <div class="value" v-for="item in card.services" :key="item.itemId">
              {{ item.itemName }}
              {{ item.cardValue && item.cardValue >= 99999 ? '不限' : item.cardValue }}
              次
            </div>
            <div class="title">可用次数</div>
          </template>
        </div>
        <div class="column">
          <template v-if="card.cardDiscount !== 10">
            <div class="value">{{ card.cardDiscount }} 折</div>
            <div class="title">折扣</div>
          </template>
        </div>
        <div class="column">
          <div class="value">{{ calcValidityDate(card) }}</div>
          <div class="title">有效期</div>
        </div>
        <div class="column" @click="showDialog = true">
          <icon-svg name="right" color="#8995AD"></icon-svg>
        </div>
      </div>
    </div>
    <NutcardsCode v-model="showDialog" />
  </div>
</template>
<script setup lang="ts" name="MaterialSetting">
  import MemberCard from '@/components/MemberCard.vue'
  import NutcardsCode from '@/components/NutcardsCode.vue'
  import { useCardStore } from '@/store'
  import { StorePrepaidCardViewModel } from 'model'

  const showDialog = $ref(false)
  const cardList = useCardStore().getCardList()
  function calcValidityDate(card: StorePrepaidCardViewModel) {
    if (!card.validityDate && card.validityDate !== 0) {
      return ''
    }
    if (card.validType === 0) {
      if (card.validityDate === 0) {
        return '永久有效'
      } else {
        const year = Math.floor(card.validityDate / 365)
        const month = Math.floor((card.validityDate % 365) / 30)
        const day = (card.validityDate % 365) % 30
        return (
          (year === 0 ? '' : year + '年') +
          (month === 0 ? '' : month + '月') +
          (day === 0 ? '' : day + '天')
        )
      }
    } else {
      return card.invalidDate
    }
  }
</script>
<style lang="scss" scoped>
  .member-card {
    padding-bottom: 25px;
    .top-bar {
      height: 84px;
      padding-top: 15px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .title {
        font-size: 18px;
        height: 24px;
        display: flex;
        align-items: center;
        font-weight: bold;
        color: #152c5b;
        .icon-svg {
          margin-right: 6px;
        }
      }
    }
    .content {
      border-radius: 20px;
      background: #ffffff;
      .item {
        min-height: 180px;
        padding: 0 40px;
        border-bottom: 1px solid #eaeef7;
        display: flex;
        align-items: center;
        .title {
          font-size: 14px;
          color: #717f9d;
          line-height: 35px;
        }
        .value {
          font-size: 16px;
          color: #152c5b;
          line-height: 22px;
        }
        &:last-child {
          border-bottom: 0;
        }
        .column {
          display: flex;
          align-items: center;
          flex-direction: column;
        }
        .column:nth-child(1) {
          flex: 0 200px;
        }
        .column:nth-child(2) {
          flex: 1 250px;
          justify-content: center;
          display: flex;
        }
        .column:nth-child(3) {
          flex: 1 250px;
          justify-content: center;
          display: flex;
        }
        .column:nth-child(4) {
          flex: 1 250px;
          justify-content: center;
          display: flex;
        }
        .column:nth-child(5) {
          flex: 1 250px;
          justify-content: center;
          display: flex;
        }
        .column:nth-child(6) {
          flex: 0 50px;
          justify-content: flex-end;
          cursor: pointer;
        }
      }
    }
  }
</style>
