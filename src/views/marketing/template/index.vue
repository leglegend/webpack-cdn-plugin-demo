<template>
  <div class="message-template">
    <div class="template-content">
      <div class="top-bar">
        <div class="title">
          <icon-svg name="problem" color="#0075FF" size="24"></icon-svg>
          给会员群发消息时，可以直接选择已创建的消息模板使用
        </div>
        <el-button round @click="onCreate">
          <template #icon>
            <img
              src="@/assets/add.png"
              style="width: 20px; height: 20px; position: relative; top: -2px"
            />
          </template>
          新建消息模板
        </el-button>
      </div>
      <div class="template-list">
        <div class="template-item" v-for="item in templates" :key="item.id">
          <div class="item-header">
            <div>{{ item.tempName }}</div>
            <el-button link type="primary">预览</el-button>
          </div>
          <div class="item-content">
            {{ item.tempInfo }}
          </div>
          <div class="item-footer">
            <div class="item-msgs">
              <icon-svg v-for="(msg, index) in item.attachments" :key="index" name="add"></icon-svg>
            </div>
            <el-button link @click="onEdit(item)">
              <template #icon>
                <icon-svg name="edit"></icon-svg>
              </template>
              编辑
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="false" class="template-none">
      <img class="none-img" src="@/assets/marketing_none.png" />
      <div class="none-title">
        自动群发消息给客户
        <icon-svg name="problem" color="#0075FF" size="24"></icon-svg>
      </div>
      <div class="none-text">
        <div>设置群发规则和发送的消息内容</div>
        <div>触发规则后自动给会员发送消息</div>
        <div>每位会员每天可接收一条群发消息</div>
      </div>
      <el-button size="large" type="primary" round>新建消息模板</el-button>
    </div>
    <CreateTemplate v-model="showDialog" :template="template" />
  </div>
</template>
<script setup lang="ts" name="MessageTemplate">
  import { WorkWeChatMsgTemplateViewModel } from 'model'
  import CreateTemplate from './CreateTemplate.vue'
  import { useTemplateStore } from '@/store'

  let showDialog = $ref(false)

  const templates = useTemplateStore().getTemplatesList()
  let template = $ref<WorkWeChatMsgTemplateViewModel | null>()

  function onCreate() {
    template = null
    showDialog = true
  }
  function onEdit(item: WorkWeChatMsgTemplateViewModel) {
    template = item
    showDialog = true
  }
</script>
<style lang="scss" scoped>
  .message-template {
    min-height: var(--app-main-height);
    .template-content {
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
          gap: 5px;
          .icon-svg {
            margin-left: 6px;
          }
        }
      }
      .template-list {
        padding-bottom: 25px;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        .template-item {
          background: #ffffff;
          border-radius: 15px;
          width: 390px;
          .item-header {
            display: flex;
            justify-content: space-between;
            padding: 25px 20px 0 20px;
            font-size: 18px;
            font-weight: bold;
            color: #152c5b;
            height: 55px;
            align-items: flex-start;
            line-height: 30px;
            .el-button {
              line-height: 30px;
            }
          }
          .item-content {
            padding: 0 15px;
            font-size: 14px;
            font-weight: 400;
            color: #717f9d;
            line-height: 30px;
            box-sizing: border-box;
          }
          .item-footer {
            margin-top: 30px;
            border-top: 1px solid #ebebeb;
            height: 80px;
            box-sizing: border-box;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        }
      }
    }
    .template-none {
      height: 100%;
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
</style>
