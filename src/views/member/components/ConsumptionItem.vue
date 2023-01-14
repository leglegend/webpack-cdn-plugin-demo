<template>
  <div
    :class="[
      'consume-item',
      item.consumptionTag == 30 || item.consumptionTag == 31 ? 'consume-refund-item' : ''
    ]"
  >
    <div class="refund-order-bg">
      <div class="item-box">
        <span class="item-left"><img :src="item.consumptionImg!" /></span>
        <span class="item-right">
          <span class="right-1">
            <div class="right-name">
              {{
                type == 'home'
                  ? userName
                  : item.operationType == 1
                  ? item.storeUserName
                  : '用户扫描'
              }}
              <div class="item-icons" @click.stop="showBox">
                <img
                  v-if="item.isRefunds"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_refund.png"
                  alt=""
                />
                <img
                  v-if="item.isAxc"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_axc.png"
                />
                <img
                  v-if="item.isIntegral"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon__point.png"
                />
                <img
                  v-if="item.isCoupon"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_coupon.png"
                />
                <img
                  v-if="item.cardId! > 0"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_member.png"
                />
                <img
                  v-if="item.isPerformance && item.performanceState! > -2 && item.isHaveInfo"
                  :src="
                    'https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_pre_' +
                    item.performanceState +
                    '.png'
                  "
                />
                <img
                  v-if="item.isOfflineOrder"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_hand.png"
                />
                <img
                  v-if="!item.isBookkeeping"
                  src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_none.png"
                />
              </div>
            </div>
            <div>
              {{ calcYear + item.createDate }}
            </div>
          </span>
          <span class="right-2">
            <div
              class="option-list"
              v-if="(!products || products.length === 0) && (!services || services.length === 0)"
            >
              <span class="option-title" style="text-align: left; box-sizing: border-box">
                {{ item.consumptionTagValue }}
              </span>
              <span class="option-value">{{ item.consumptionValue }}</span>
            </div>
            <div v-if="products && products.length > 0">
              <span class="list-title">
                {{ item.consumptionTagValue }}
                <span class="option-img" v-if="item.isPerformance && item.performanceState != -2">
                  <img
                    :src="
                      'https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/pre-order-' +
                      item.performanceState +
                      '.png'
                    "
                  />
                </span>
              </span>
              <template v-for="(product, productIndex) in products">
                <span v-if="product.payPrice" class="items-list" :key="productIndex">
                  <div class="option-list">
                    <span class="option-title" style="text-align: left">
                      {{ product.productTitle
                      }}{{ product.productSum! > 1 ? ' x' + product.productSum : '' }}
                    </span>
                    <span class="option-value">-{{ product.payPrice }}</span>
                  </div>
                </span>
              </template>
            </div>
            <div v-if="services && services.length > 0">
              <span
                class="list-title"
                :style="{ display: products && products.length > 0 ? 'none' : '' }"
              >
                {{ item.consumptionTagValue }}
              </span>
              <template v-for="(service, serviceIndex) in services">
                <span class="items-list" v-if="service.consumptionValue" :key="serviceIndex">
                  <div class="option-list">
                    <span class="option-title" style="text-align: left">
                      {{ service.itemName }}
                      {{
                        item.cardType == 1 && service.consumptionValue > 1
                          ? ' x' + service.consumptionValue
                          : ''
                      }}
                    </span>
                    <span class="option-value" v-if="item.consumptionTag != 6">
                      {{
                        service.consumptionValue >= 10000
                          ? ''
                          : item.consumptionTag == 4
                          ? '+'
                          : '-'
                      }}{{
                        (item.cardType == 0 || item.cardType == 2) && item.consumptionType == 0
                          ? service.consumptionValue >= 10000
                            ? '不限'
                            : service.consumptionValue
                          : service.payPrice
                      }}{{
                        (item.cardType == 0 || item.cardType == 2) && item.consumptionType == 0
                          ? service.itemUnit || '次'
                          : currencyName
                      }}
                    </span>
                    <span class="option-value" v-if="item.consumptionTag == 6">
                      {{
                        service.consumptionValue >= 10000
                          ? '不限'
                          : '+' + service.consumptionValue + (service.itemUnit || '次')
                      }}
                    </span>
                  </div>
                </span>
              </template>
            </div>
            <div
              class="right-2-after"
              v-if="
                item.cardType != 2 &&
                item.consumptionTag != 20 &&
                item.consumptionTag != 21 &&
                item.consumptionTag != 22 &&
                item.consumptionTag != 5 &&
                item.consumptionTag != 30 &&
                item.consumptionTag != 31 &&
                item.cardType != 3 &&
                item.consumptionType != 4
              "
            >
              余{{ item.afterValue }}
            </div>
            <div
              v-if="item.cardType == 3 && (item.consumptionTag == 4 || item.consumptionTag == 2)"
              class="right-2-after"
            ></div>
            <div
              class="right-2-after"
              v-if="
                item.consumptionTag == 20 || item.consumptionTag == 21 || item.consumptionTag == 22
              "
            >
              {{ item.afterValue }}
            </div>
          </span>
        </span>
      </div>
      <div class="right-remark" v-if="item.businessRemark">
        <text>*</text>
        备注：{{ item.businessRemark }}
      </div>
      <div
        class="icon-dialog"
        v-if="showIcon"
        @click.stop="hideBox"
        :style="{ 'animation-name': isClose ? 'hide-icon-dialog' : '' }"
      >
        <div
          class="icon-box"
          :style="{ 'animation-name': isClose ? 'hide-icon-box' : '' }"
          @click.stop=""
        >
          <div class="box-ctx">
            <div class="ctx-item" v-if="item.isRefunds">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_refund.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易订单已退款</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isAxc">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_axc.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易为支付宝安心充</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isIntegral">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon__point.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">此订单获得了积分或消费了积分</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isCoupon">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_coupon.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">此订单使用了优惠券</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.cardId! > 0">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_member.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该用户为会员</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isPerformance && item.performanceState == 0">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_pre_0.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易未设置绩效</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isPerformance && item.performanceState == 1">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_pre_1.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易已设置绩效</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isPerformance && item.performanceState == -1">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_pre_-1.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易无需设置绩效</div>
              </div>
            </div>
            <div class="ctx-item" v-if="item.isOfflineOrder">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_hand.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易为手动添加</div>
              </div>
            </div>
            <div class="ctx-item" v-if="!item.isBookkeeping">
              <img
                src="https://linkfit-pro.oss-cn-hangzhou.aliyuncs.com/Business/static/hom_list_icon_none.png"
              />
              <div class="item-text">
                <div class="demo-height"></div>
                <div class="text">该交易未计入营业额</div>
              </div>
            </div>
          </div>
          <div class="box-btn" @click="hideBox">知道了</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { BusinessGetUserConsumptionListResponseViewModel } from 'model'
  import type { PropType } from 'vue'

  export default defineComponent({
    props: {
      item: {
        type: Object as PropType<BusinessGetUserConsumptionListResponseViewModel>,
        required: true
      }
    },
    data() {
      return {
        showIcon: false,
        isClose: false,
        type: 'member'
      }
    },
    computed: {
      currencyName() {
        return '元'
      },
      userName() {
        return this.item.storeUserName
      },
      products() {
        const products = []
        if (this.item.products) {
          for (const product of this.item.products) {
            if (product.payPrice) {
              products.push(product)
            }
          }
        }
        return products
      },
      services() {
        const services = []
        if (this.item.serviceItems) {
          for (const product of this.item.serviceItems) {
            if (product.consumptionValue) {
              services.push(product)
            }
          }
        }
        return services
      },
      calcYear() {
        const year = new Date().getFullYear() + ''
        if (this.item.createYear && this.item.createYear !== year) {
          return this.item.createYear + '-'
        }
        return ''
      }
    },
    methods: {
      showBox() {
        this.isClose = false
        this.showIcon = true
      },
      hideBox() {
        this.isClose = true
        setTimeout(() => (this.showIcon = false), 300)
      }
    }
  })
</script>
<style lang="scss" scoped>
  .consume-item {
    box-sizing: border-box;
    position: relative;
    border-bottom: 1px solid #f4f6fb;
    display: initial;
    span {
      display: inline-block;
      vertical-align: top;
      line-height: inherit;
    }

    .item-box {
      padding-top: 12px;
      padding-bottom: 12px;
      display: flex;
      align-items: center;

      .item-left {
        height: 50px;
        width: 50px;
        flex: none;
        img {
          width: 50px;
          height: 50px;
          vertical-align: top;
          display: inline-block;
          border-radius: 50%;
        }
      }

      .item-right {
        box-sizing: border-box;
        position: relative;
        flex: auto;
        padding-left: 15px;

        .right-1 {
          width: 40%;
          box-sizing: border-box;

          span {
            display: inline-block;
            vertical-align: top;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 100%;
          }

          div {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            &:nth-child(1) {
              font-size: 14px;
              font-weight: 500;
            }

            &:nth-child(2) {
              font-size: 14px;
              color: #bfbfbf;

              .useTimes {
                display: inline-block;
              }
            }
          }
          .right-name {
            display: flex;
            align-items: center;
            gap: 5px;
          }
        }

        .right-2 {
          width: 60%;
          font-size: 14px;

          .option-list {
            .option-title {
              width: 50%;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              color: #a7a7a7;

              .option-img {
                img {
                  width: 17px;
                  height: 17px;
                  display: inline-block;
                  vertical-align: top;
                }
              }
            }

            .option-value {
              width: 50%;
              text-align: right;
            }
          }

          .list-title {
            width: 21%;
            text-align: left;
            white-space: nowrap;
            color: #a7a7a7;

            .option-img {
              img {
                width: 17px;
                height: 17px;
                display: inline-block;
                vertical-align: top;
              }
            }
          }

          .items-list {
            width: 100%;
          }

          .right-2-after {
            font-size: 14px;
            text-align: right;
            color: #bfbfbf;
          }
        }

        .right-bottom {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 1px;
          background: #e9e9e9;
          transform: scale(1, 0.4);
          transform-origin: center bottom;
        }
      }

      .item-icons {
        display: flex;
        gap: 5px;
        align-items: center;
        img {
          width: 17px;
          height: 17px;
        }
      }
    }

    .right-remark {
      text-align: right;
      font-size: 14px;
      color: #c48f21;
      width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      top: -5px;
      text {
        color: red;
      }
    }

    .use-coupon {
      position: absolute;
      right: 0.5vw;
      top: 0vw;
      z-index: 100;
      width: 4.3vw;
      text-align: center;
      top: 4.8vw;
      overflow: hidden;

      span {
        width: 0vw;
        height: 3.5vw;
        display: inline-block;
        vertical-align: top;
      }

      div {
        height: 3.5vw;
        width: 4.3vw;
        box-sizing: border-box;
      }

      img {
        width: 4.3vw;
        height: 2.8vw;
        display: inline-block;
        vertical-align: top;
      }
    }

    @keyframes show-icon-dialog {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes hide-icon-dialog {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    .icon-dialog {
      position: fixed;
      z-index: 1001;
      left: 0;
      top: 0;
      width: 100vw;
      height: 100vh;
      text-align: center;
      opacity: 0;
      background: rgba(0, 0, 0, 0.35);
      animation-name: show-icon-dialog;
      animation-duration: 0.3s;
      animation-fill-mode: forwards;
      display: flex;
      justify-content: center;
      align-items: center;

      .icon-box {
        display: inline-block;
        vertical-align: middle;
        width: 60vw;
        border-radius: 2.8vw;
        background: white;
        padding-top: 6.7vw;
        animation: show-icon-box 0.3s forwards;
        transform-origin: center center;
        @keyframes show-icon-box {
          from {
            transform: scale(0.4);
          }
          to {
            transform: scale(0.5);
          }
        }

        @keyframes hide-icon-box {
          from {
            transform: scale(0.5);
          }
          to {
            transform: scale(0.4);
          }
        }

        .box-ctx {
          text-align: left;
          padding-left: 10vw;
          padding-bottom: 1.4vw;

          .ctx-item {
            margin-bottom: 4vw;
            min-height: 5.4vw;
            display: flex;
            align-items: flex-start;

            img {
              width: 5.4vw;
              height: 5.4vw;
              display: flex;
            }

            .item-text {
              margin-left: 3.1vw;
              width: 32vw;
              display: flex;
              min-height: 5.4vw;
              align-items: center;

              .text {
                width: 32vw;
                line-height: 3.7vw;
                color: #555555;
                font-size: 3.1vw;
                font-weight: 500;
              }
            }
          }
        }

        .box-btn {
          background: #e7e7e76b;
          height: 12vw;
          line-height: 12vw;
          color: #7abb70;
          font-size: 4.4vw;
          font-weight: 500;
          border-bottom-left-radius: 2.8vw;
          border-bottom-right-radius: 2.8vw;
        }
      }
    }
  }
  .consume-refund-item {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    box-sizing: border-box;
    .refund-order-bg {
      width: 690px;
      background: linear-gradient(90deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%);
      border-radius: 7px;
      .option-title {
        color: #ff0000 !important;
      }
      .option-value {
        color: #ff0000 !important;
      }
      .item-left {
        padding-left: 2.26vw !important;
      }
    }
  }
</style>
