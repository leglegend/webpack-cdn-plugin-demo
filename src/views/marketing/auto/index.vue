<template>
  <div class="marketing-auto">
    <div v-if="!tableLoading && messages.length" class="marketing-content">
      <div class="top-bar">
        <div class="title" @click="showTipsDialog = true">
          自动群发消息给客户
          <icon-svg name="problem" color="#0075FF" size="24"></icon-svg>
        </div>
        <el-button round @click="onCreate" :loading="dialogLoading && !currentId">
          <template #icon>
            <img
              src="@/assets/add.png"
              style="width: 20px; height: 20px; position: relative; top: -2px"
            />
          </template>
          新建自动群发规则
        </el-button>
      </div>
      <div class="marketing-list">
        <el-table
          :loading="tableLoading"
          :data="messages"
          :style="{ width: '100%' }"
          :row-style="{ height: '67px', 'font-size': '16px' }"
          :header-row-style="{ height: '58px', 'font-size': '16px' }"
        >
          <el-table-column prop="msgInfo" label="消息内容" min-width="500" align="center" />
          <el-table-column
            prop="searchConditionTitle"
            label="发送会员"
            width="250"
            align="center"
          />
          <el-table-column prop="sendTime" label="发送时间" width="250" align="center" />
          <el-table-column prop="state" label="启用" width="250" align="center">
            <template #default="{ row }">
              <el-switch :model-value="!!row.state" @change="onStateChange(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="option" label="操作" width="150" align="center">
            <template #default="{ row }">
              <el-button
                size="small"
                @click="onEdit(row.id)"
                :loading="dialogLoading && currentId === row.id"
              >
                编辑
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div v-else-if="!tableLoading" class="marketing-none">
      <img class="none-img" src="@/assets/marketing_none.png" />
      <div class="none-title">
        自动群发消息给客户
        <icon-svg
          name="problem"
          color="#0075FF"
          size="24"
          @click="showTipsDialog = true"
        ></icon-svg>
      </div>
      <div class="none-text">
        <div>设置群发规则和发送的消息内容</div>
        <div>触发规则后自动给会员发送消息</div>
        <div>每位会员每天可接收一条群发消息</div>
      </div>
      <el-button size="large" type="primary" round @click="onCreate">新建自动群发规则</el-button>
    </div>
    <CreateRule
      v-model="showDialog"
      v-model:loading="dialogLoading"
      :id="currentId"
      @refresh="onRefresh()"
    />

    <el-dialog title="说明" v-model="showTipsDialog" append-to-body>
      <div class="message-tips">
        <div class="tip-item">
          <div class="title">群发是否有频率限制？</div>
          <div class="text">
            每位客户每天可接收1条群发消息，不限为企业发布的群发还是个人发布的群发。
          </div>
        </div>
        <div class="tip-item">
          <div class="title">群发助手其他注意事项</div>
          <div class="text">
            1、群发消息不得出现违反法律法规或侵犯他人合法权益的内容，企业应对其制作、发送和传播的群发消息内容承担全部法律责任。
          </div>
          <div class="text">
            2、不得以任何方式滥用群发助手实施恶意骚扰用户、开展过度营销等行为。
          </div>
          <div class="text">
            3、如企业微信帐号存在异常，则可能导致群发消息发送失败或异常等情况。
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
  import { Message } from 'api/Message'
  import { GetWorkWeChatMsgsResponseModel } from 'model'
  import CreateRule from './CreateRule.vue'
  import { useConditionStore } from '@/store'

  export default {
    name: 'AutoSend'
  }
</script>
<script setup lang="ts" name="AutoSend">
  useConditionStore().getConditionList()
  let showDialog = $ref(false)
  const showTipsDialog = $ref(false)

  const messageApi = new Message()
  let messages = $ref<GetWorkWeChatMsgsResponseModel[]>([])
  let currentId = $ref<number | null>()
  let tableLoading = $ref(true)
  const dialogLoading = $ref(false)
  function onRefresh() {
    tableLoading = true
    messageApi
      .getWorkWeChatMsgs({ msgType: 1, pageSize: 10, pageIndex: 1 })
      .then(res => {
        if (res.data) messages = res.data
      })
      .finally(() => (tableLoading = false))
  }
  onRefresh()
  function onCreate() {
    currentId = null
    showDialog = true
  }
  function onEdit(id: number) {
    currentId = id
    showDialog = true
  }

  function onOpenInfo() {
    ElMessageBox.alert('')
  }
  function onStateChange(item: GetWorkWeChatMsgsResponseModel) {
    item.state = item.state ? 0 : 1
  }
</script>
<style lang="scss" scoped>
  .marketing-auto {
    min-height: var(--app-main-height);
    .marketing-content {
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
            margin-left: 6px;
          }
        }
      }
      .marketing-list {
        background: #ffffff;
        border-radius: 30px;
        overflow: hidden;
        .el-table {
          --el-table-header-text-color: #152c5b;
          --el-table-header-bg-color: #f8fbfd;
        }
      }
    }
    .marketing-none {
      height: var(--app-main-height);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      user-select: none;
      .none-img {
        width: 194px;
        height: 112px;
      }
      .none-title {
        font-size: 18px;
        height: 24px;
        display: flex;
        align-items: center;
        font-weight: bold;
        color: #152c5b;
        margin: 50px 0 20px 0;
        .icon-svg {
          margin-left: 6px;
        }
      }
      .none-text {
        font-size: 16px;
        color: #717f9d;
        line-height: 26px;
        margin-bottom: 50px;
      }
    }
  }
  .message-tips {
    display: flex;
    flex-direction: column;
    gap: 20px;
    .tip-item {
      .title {
        font-size: 14px;
        color: #152c5b;
        font-weight: bold;
        line-height: 35px;
      }
      .text {
        font-size: 14px;
        color: #717f9d;
        padding: 5px;
      }
    }
  }
</style>
