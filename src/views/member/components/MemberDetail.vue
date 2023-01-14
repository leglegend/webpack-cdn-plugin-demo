<template>
  <teleport to="body">
    <div class="member-detail">
      <el-drawer v-model="showDialog" modal-class="member-detail" :with-header="false" size="70%">
        <div class="member-content">
          <div class="member-info">
            <el-scrollbar>
              <div class="member-info">
                <div class="info-header">
                  <div class="flag"></div>
                  <el-button link @click="showEditDialog = true" :loading="editLoading">
                    <template #icon>
                      <icon-svg name="edit" color="#ffffff" size="19px"></icon-svg>
                    </template>
                  </el-button>
                </div>
                <div class="user-logo">
                  <el-avatar :src="(member.userImg as string)" :size="88"></el-avatar>
                </div>
                <div class="user-name">{{ member.userName }}</div>
                <div class="user-mobile">{{ member.userMobile }}</div>
                <div class="user-tags">
                  <template v-for="item in member.groups" :key="item.groupId">
                    <icon-svg v-if="item.groupIcon" name="flag" :color="item.groupIcon"></icon-svg>
                    <div v-else class="item">
                      {{ item.groupName }}
                    </div>
                  </template>
                </div>
                <div class="more">
                  <div class="line"></div>
                  更多
                  <div class="line"></div>
                </div>
                <div class="user-material">
                  <div
                    class="item"
                    v-for="item in member.storeUserInfo"
                    :key="(item.controlName as string)"
                  >
                    <div class="name">{{ item.controlInstructions }}</div>
                    <div class="value" v-if="item.controlName === 'user_sex'">
                      {{ item.controlValue === '1' ? '男' : '女' }}
                    </div>
                    <div class="value" v-else-if="item.controlInstructions === '会员照片'">
                      <img :src="item.controlValue!" />
                    </div>
                    <div class="value" v-else>
                      {{ item.controlValue }}
                    </div>
                  </div>
                </div>
                <div class="user-bottom"></div>
              </div>
            </el-scrollbar>
          </div>
          <div class="member-balance">
            <div class="dialog-header">
              <div class="title">会员详情</div>
              <div class="buttons">
                <el-button round @click="onDelete">删除</el-button>
                <el-button type="primary" round>加好友</el-button>
                <el-button type="success" round>发消息</el-button>
                <div class="close">
                  <el-button circle plain type="info" @click="showDialog = false">
                    <template #icon>
                      <icon-svg name="remove"></icon-svg>
                    </template>
                  </el-button>
                </div>
              </div>
            </div>
            <div class="balance-content">
              <el-scrollbar>
                <div class="content-main">
                  <div class="board">
                    <div class="item">
                      <div class="name">累计充值</div>
                      <div class="value">{{ member.sumRenewal || 0 }}</div>
                    </div>
                    <div class="item">
                      <div class="name">卡内消费（元）</div>
                      <div class="value">{{ member.totalMoney || 0 }}</div>
                    </div>
                    <div class="item">
                      <div class="name">卡外消费（元）</div>
                      <div class="value">{{ member.sumPrice || 0 }}</div>
                    </div>
                    <div class="item">
                      <div class="name">消费次数</div>
                      <div class="value">{{ member.totalNum || 0 }}</div>
                    </div>
                  </div>
                  <el-tabs v-model="activeName" class="demo-tabs">
                    <el-tab-pane :label="`会员卡(${member.cards?.length || 0})`" name="card">
                      <div class="tab-content">
                        <div class="card-item" v-for="card in member.cards" :key="card.id">
                          <div class="column">
                            <MemberCard :card="card" />
                          </div>
                          <div class="column">
                            <template v-if="card.cardType === 1">
                              <div class="title">{{ card.cardPrice }} 元</div>
                            </template>
                            <template v-else-if="card.cardType === 0 || card.cardType === 2">
                              <div class="title" v-for="item in card.services" :key="item.itemId">
                                {{ item.itemName }}
                                {{
                                  item.cardValue && item.cardValue >= 99999
                                    ? '不限'
                                    : item.cardValue
                                }}
                                次
                              </div>
                            </template>
                          </div>
                          <div class="column">
                            <div class="value">{{ calcStateName(card.state!) }}</div>
                          </div>
                          <div class="column">
                            <div class="value">有效期至{{ card.validityDate }}</div>
                            <div>
                              <el-button size="small" @click="showCode = true">
                                <template #icon>
                                  <icon-svg name="edit"></icon-svg>
                                </template>
                                编辑
                              </el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane :label="`优惠券(${coupons?.length || 0})`" name="coupon">
                      <div class="tab-content">
                        <div class="coupon-item" v-for="item in coupons" :key="item.couponId">
                          <MemberCoupon :coupon="item" />
                          <div class="item-btn">
                            <el-button
                              @click="showCode = true"
                              round
                              type="primary"
                              size="small"
                              plain
                            >
                              核销
                            </el-button>
                            {{ item.couponSourceContent }}
                          </div>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane :label="`积分(${member.cardIntegral || 0})`" name="integral">
                      <div class="tab-content">
                        <div class="member-integral">
                          <div class="integral-info">
                            <div class="title">积分</div>
                            <div class="value">{{ member.cardIntegral }}</div>
                          </div>
                          <el-button round type="primary" size="small" @click="showCode = true">
                            调整
                          </el-button>
                        </div>
                      </div>
                    </el-tab-pane>
                    <el-tab-pane :label="`佣金(${member.commission || 0})`" name="commission">
                      <div class="tab-content">
                        <div class="member-integral">
                          <div class="integral-info">
                            <div class="title">佣金</div>
                            <div class="value">{{ member.commission }}</div>
                          </div>
                          <el-button round type="primary" size="small" @click="showCode = true">
                            调整
                          </el-button>
                        </div>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                  <div class="options-list">
                    <div class="list-title">会员动态</div>
                    <div class="consumption-list">
                      <ConsumptionItem
                        :item="item"
                        v-for="item in consumptionList"
                        :key="item.consumptionId"
                      />
                    </div>
                    <div class="consumption-page">
                      <el-pagination
                        small
                        background
                        v-model:currentPage="currentPage"
                        layout="prev, pager, next"
                        :total="total"
                      />
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </el-drawer>
    </div>
  </teleport>
  <NutcardsCode v-model="showCode" />
  <CreateMember
    v-model="showEditDialog"
    v-model:loading="editLoading"
    :member="member"
    @refresh="getUserInfo"
  />
</template>
<script setup lang="ts">
  import NutcardsCode from '@/components/NutcardsCode.vue'
  import MemberCoupon from '@/components/MemberCoupon.vue'
  import ConsumptionItem from './ConsumptionItem.vue'
  import { User } from 'api/User'
  import { Consumption } from 'api/Consumption'
  import { Coupon } from 'api/Coupon'
  import {
    GetUserInfoResponseModel,
    BusinessGetUserConsumptionListResponseViewModel,
    UserCouponViewModel
  } from 'model'
  import MemberCard from '@/components/MemberCard.vue'
  import pageHook from '@/utils/hooks/page'

  const props = defineProps<{
    modelValue: boolean
    loading: boolean
    current?: GetUserInfoResponseModel
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'update:loading', loading: boolean): void
    (e: 'edit', member: GetUserInfoResponseModel): void
    (e: 'refresh'): void
  }>()
  // 关闭弹窗时是否需要刷新列表
  let needRefresh = false
  let showDialog = $computed({
    get: () => props.modelValue && !props.loading,
    set: val => {
      if (needRefresh) emit('refresh')
      emit('update:modelValue', val)
    }
  })
  watch(
    () => props.modelValue,
    async () => {
      if (!props.modelValue) return
      emit('update:loading', true)
      await getUserInfo()
      getCoupons()
      needRefresh = false
      if (currentPage.value === 1) getConsumptionList()
      else currentPage.value = 1
      emit('update:loading', false)
    }
  )

  const userApi = new User()

  // #region 会员信息
  let member = $ref<GetUserInfoResponseModel>({})
  async function getUserInfo() {
    const res = await userApi.getUserInfo(props.current!)
    if (res.data) member = res.data
    needRefresh = true
  }
  // #endregion

  // #region 会员资产
  const activeName = $ref('card')
  const showCode = $ref(false)
  function calcStateName(state: number): string {
    switch (state) {
      case 1:
        return '正常'
      case 0:
        return '未开卡'
      case -1:
        return '销卡'
      case -2:
        return '商家删除'
      case 2:
        return '已过期'
      case -3:
        return '过期续费删除'
      case 3:
        return '停卡'
      case 4:
        return '转让中'
    }
    return ''
  }

  const couponApi = new Coupon()
  let coupons = $ref<UserCouponViewModel[] | null | undefined>()
  function getCoupons() {
    couponApi
      .getUserCouponList({ cardId: member.cardId, userId: member.userId, queryState: 1 })
      .then(res => {
        coupons = res.data?.coupons
      })
  }
  // #endregion

  // #region 会员操作
  const showEditDialog = $ref(false)
  const editLoading = $ref(false)
  function onDelete() {
    ElMessageBox.confirm('删除会员后不可恢复，是否继续？', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      const loading = ElLoading.service()
      userApi
        .deleteUser({ cardId: member.cardId })
        .then(() => {
          showDialog = false
          emit('refresh')
        })
        .finally(() => loading.close())
    })
  }
  // #endregion

  // #region 会员流水
  const consumptionApi = new Consumption()
  let consumptionList = $ref<BusinessGetUserConsumptionListResponseViewModel[]>([])
  const { currentPage, total, addCurrentChangeEvent } = pageHook(true)
  function getConsumptionList() {
    consumptionApi
      .businessGetUserConsumptionList({
        cardId: member.cardId,
        userId: member.userId,
        pageIndex: currentPage.value,
        pageSize: 10
      })
      .then(res => {
        if (res.data?.data) consumptionList = res.data?.data
        total.value = res.data?.totalCount!
      })
  }
  addCurrentChangeEvent(getConsumptionList)
  // #endregion
</script>
<style lang="scss" scoped>
  .member-detail {
    :deep(.el-drawer) {
      border-radius: 50px 0px 0px 50px;
      padding: 0;
      --el-drawer-padding-primary: 0px;
    }

    .member-content {
      display: flex;
      height: 100%;
      .member-info {
        flex: 0 330px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: #2959ad;
        .info-header {
          height: 80px;
          display: flex;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          padding: 0 11px;
          .flag {
            color: #fefeff;
            font-weight: 400;
            font-size: 14px;
          }
        }
        .user-logo {
          width: 104px;
          height: 104px;
          background: #ffffff10;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-name {
          font-size: 20px;
          font-weight: bold;
          color: #ffffff;
          line-height: 40px;
          margin-top: 4px;
        }
        .user-mobile {
          font-size: 16px;
          font-weight: 400;
          color: #27bbff;
          line-height: 1;
        }
        .user-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
          padding: 28px 17px;
          .item {
            padding: 0 12px;
            height: 30px;
            line-height: 30px;
            border: 1px solid #27bbff;
            border-radius: 15px;
            font-size: 12px;
            font-weight: 400;
            color: #ffffff;
          }
        }
        .more {
          width: 100%;
          display: flex;
          align-items: center;
          height: 65px;
          font-size: 14px;
          color: #ffffff;
          font-weight: bold;
          justify-content: space-between;
          .line {
            width: 130px;
            height: 1px;
            background: #eaeef7;
            opacity: 0.2;
          }
        }
        .user-material {
          width: 315px;
          background: #1c4c9e;
          border-radius: 5px;
          padding: 0 12px;
          box-sizing: border-box;
          .item {
            min-height: 45px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .name {
              font-size: 14px;
              font-weight: bold;
              color: #ffffff;
            }
            .value {
              font-size: 14px;
              color: #ffffff;
              font-weight: 400;
              img {
                width: 100px;
                border-radius: 5px;
              }
            }
          }
        }
        .user-bottom {
          padding: 10px;
        }
      }

      .member-balance {
        flex: auto;
        background: #e6e9f0;
        overflow: hidden;
        .dialog-header {
          display: flex;
          height: 60px;
          background: #ffffff;
          padding: 0 23px;
          justify-content: space-between;
          align-items: center;
          .title {
            font-size: 18px;
            color: #152c5b;
            font-weight: bold;
          }
          .buttons {
            display: flex;
            .close {
              padding-left: 24px;
            }
          }
        }
        .balance-content {
          height: calc(100vh - 60px);
          .content-main {
            padding: 17px;
            box-sizing: border-box;

            .board {
              height: 100px;
              background: #ffffff;
              border-radius: 20px;
              display: flex;
              align-items: center;
              justify-content: space-around;
              margin-bottom: 10px;
              .item {
                width: 120px;
                display: flex;
                align-items: center;
                flex-direction: column;
                .name {
                  font-size: 16px;
                  color: #717f9d;
                  font-weight: 400;
                  line-height: 1;
                  margin-bottom: 20px;
                }
                .value {
                  line-height: 20px;
                  font-weight: normal;
                  color: #0075ff;
                  font-size: 26px;
                }
              }
            }
            .tab-content {
              background: #ffffff;
              border-radius: 20px;
              padding: 0 35px;
              .card-item {
                padding-top: 20px;
                min-height: 140px;
                display: flex;
                border-bottom: 1px solid #eaeef7;
                display: flex;
                .title {
                  padding-top: 13px;
                  font-size: 14px;
                  color: #152c5b;
                }
                .value {
                  padding-top: 13px;
                  font-size: 14px;
                  color: #717f9d;
                }
                &:last-child {
                  border-bottom: 0;
                }
                .column {
                  display: flex;
                  align-items: center;
                  flex-direction: column;
                  flex: auto;
                  &:nth-child(1) {
                    flex: none;
                  }
                  &:last-child {
                    align-items: flex-end;
                    gap: 30px;
                  }
                }
              }
              .member-integral {
                height: 96px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                .integral-info {
                  display: flex;
                  align-items: center;
                  .title {
                    font-size: 16px;
                    margin-right: 15px;
                  }
                  .value {
                    font-size: 28px;
                    color: #152c5b;
                  }
                }
              }
              .coupon-item {
                height: 70px;
                padding: 23px 0;
                border-bottom: 1px solid #f4f6fb;
                display: flex;
                justify-content: space-between;
                .item-btn {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-end;
                  gap: 10px;
                  color: #717f9d;
                  font-size: 14px;
                }
              }
            }
            .options-list {
              background: #ffffff;
              border-radius: 20px;
              margin-top: 17px;
              .list-title {
                line-height: 57px;
                font-size: 16px;
                font-weight: bold;
                color: #152c5b;
                padding-left: 37px;
              }
              .consumption-list {
                padding: 0 35px;
              }
              .consumption-page {
                padding: 20px 35px;
                display: flex;
                justify-content: flex-end;
              }
            }
          }
        }
      }
    }
  }
</style>
