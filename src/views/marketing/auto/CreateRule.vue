<template>
  <div>
    <el-dialog v-model="showDialog" title="新建自动群发规则" width="40%" append-to-body>
      <template #default>
        <el-form ref="formRef" :model="newMessage" class="create-rule">
          <div class="rule-item">
            <div class="title">发送会员</div>
            <div class="send-member">
              <div class="info">创建筛选条件，每次群发前会根据条件自动搜索会员</div>
              <div class="buttons">
                <el-button size="small" round @click="showSearchDialog = true">筛选会员</el-button>
                <div class="right">
                  <template
                    v-if="conditionStore.conditionList && conditionStore.conditionList.length"
                  >
                    <el-button
                      v-for="(item, index) in conditionStore.conditionList"
                      @click="onSelectCondition(item, index)"
                      size="small"
                      round
                      :key="item.id"
                      :type="currentIndex === index ? 'primary' : 'default'"
                    >
                      {{ item.conditionTitle }}
                    </el-button>
                  </template>
                </div>
              </div>

              <div class="content" v-show="currentIndex !== -1 || conditionDescribe">
                <div v-if="conditionTitle" class="content-title">
                  {{ conditionTitle }}
                </div>
                <div class="content-text">
                  {{ conditionDescribe }}
                </div>
              </div>
            </div>
          </div>

          <!-- <div class="rule-item">
          <div class="title">发送时间</div>
          <div class="send-time">
            <div class="weeks">
              <el-checkbox>周一</el-checkbox>
              <el-checkbox>周一</el-checkbox>
              <el-checkbox>周一</el-checkbox>
              <el-checkbox>周一</el-checkbox>
              <el-checkbox>周一</el-checkbox>
            </div>
            <el-time-picker
              is-range
              format="HH:mm"
              range-separator="To"
              start-placeholder="Start time"
              end-placeholder="End time"
            />
          </div>
        </div> -->

          <div class="rule-item">
            <div class="title">消息内容</div>
            <div class="message-content">
              <div class="choose"><el-button size="small" round>从消息模板中选择</el-button></div>
              <div class="textarea">
                <el-form-item
                  prop="msgInfo"
                  :rules="[
                    { required: true, message: '请输入消息内容' },
                    { max: 100, message: '模板名称最长100个字符' }
                  ]"
                >
                  <el-input
                    v-model="newMessage.msgInfo"
                    type="textarea"
                    placeholder="输入消息内容..."
                  ></el-input>
                </el-form-item>
                <MessageType v-model:messages="newMessage.attachments" />
              </div>
            </div>
          </div>
        </el-form>
      </template>
      <template #footer>
        <div class="dialog-footer">
          <el-button link type="danger" v-if="id" @click="onDelete">
            <template #icon>
              <icon-svg name="delete"></icon-svg>
            </template>
            删除该规则
          </el-button>
          <div class="footer-button">
            <el-button @click="showDialog = false" :disabled="loading">取消</el-button>
            <el-button type="primary" @click="onSave" :loading="loading">保存</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
    <MemberSearch v-model="showSearchDialog" type="save" @finish="onFinish"></MemberSearch>
  </div>
</template>
<script setup lang="ts">
  import MessageType from '@/components/MessageType.vue'
  import { Message } from 'api/Message'
  import {
    GetWorkWeChatMsgInfoResponseModel,
    GetUserSearchConditionListResponseModel,
    UserSearchConditionViewModel
  } from 'model'
  import { deepClone } from '@/utils'
  import { useConditionStore } from '@/store'
  import { FormInstance } from 'element-plus'

  const props = defineProps<{
    modelValue: boolean
    loading: boolean
    id?: number | null
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'update:loading', loading: boolean): void
    (e: 'refresh'): void
  }>()
  let showDialog = $computed({
    get: () => props.modelValue && !props.loading,
    set: val => emit('update:modelValue', val)
  })
  watch(
    () => props.modelValue,
    async () => {
      if (!props.modelValue) return
      formRef?.resetFields()
      emit('update:loading', true)
      const conditions = await conditionStore.getConditionList()
      if (props.id) {
        const res = await messageApi.getWorkWeChatMsgInfo({ id: props.id })
        if (res.data) newMessage = deepClone(res.data)

        if (newMessage.searchConditionId)
          currentIndex =
            conditions.value.findIndex(item => newMessage.searchConditionId === item.id) || -1
      } else {
        newMessage = {}
        currentIndex = -1
      }
      emit('update:loading', false)
    }
  )
  const formRef = $ref<FormInstance>()

  // #region 会员筛选
  const conditionStore = useConditionStore()
  let currentIndex = $ref(-1)
  // let condition = $ref<GetUserSearchConditionListResponseModel>()
  let currentCondition: UserSearchConditionViewModel | null = null
  let conditionTitle = $ref('')
  let conditionDescribe = $ref('')
  let showSearchDialog = $shallowRef(false)
  function onFinish(condition?: UserSearchConditionViewModel, content?: string) {
    if (condition) {
      currentIndex = -1
      conditionTitle = ''
      conditionDescribe = content || ''
      currentCondition = condition
    } else {
      currentCondition = null
      showSearchDialog = false
      onSelectCondition(conditionStore.conditionList[0], 0)
    }
  }
  function onSelectCondition(item: GetUserSearchConditionListResponseModel, index: number) {
    currentIndex = index
    conditionTitle = item.conditionTitle || ''
    conditionDescribe = item.conditionDescribe || ''
  }
  // #endregion

  let loading = $ref(false)
  const messageApi = new Message()
  let newMessage = $ref<GetWorkWeChatMsgInfoResponseModel>({})
  function onSave() {
    if (currentIndex === -1 && !currentCondition) return ElMessage.warning('请先设置筛选条件')
    loading = true
    if (currentCondition) newMessage.conditionInfo = currentCondition
    else newMessage.searchConditionId = conditionStore.conditionList[currentIndex].id
    newMessage.conditionDescribe = conditionDescribe
    newMessage.msgType = 1
    ;(props.id ? messageApi.editWorkWeChatMsg : messageApi.addWorkWeChatMsg)(newMessage)
      .then(() => {
        ElMessage.success('保存成功')
        showDialog = false
        emit('refresh')
      })
      .finally(() => (loading = false))
  }
  function onDelete() {
    loading = true
    messageApi
      .deleteWorkWeChatMsg({ id: props.id! })
      .then(() => {
        ElMessage.success('删除成功')
        showDialog = false
        emit('refresh')
      })
      .finally(() => (loading = false))
  }
</script>
<style lang="scss" scoped>
  .create-rule {
    display: flex;
    flex-direction: column;
    row-gap: 40px;
    .rule-item {
      display: flex;
      .el-form-item {
        flex: auto;
      }
      .title {
        flex: none;
        width: 90px;
        line-height: 30px;
        color: #152c5b;
        font-weight: bold;
        font-size: 16px;
      }
      .send-member {
        display: flex;
        flex-direction: column;
        flex: 1;
        row-gap: 8px;
        .info {
          color: #8995ad;
          line-height: 30px;
        }
        .buttons {
          display: flex;
          justify-content: space-between;
          row-gap: 8px;
          .right {
            display: flex;
            flex-wrap: wrap;
            row-gap: 8px;
            .el-button {
              margin-left: 12px;
            }
          }
        }
        .content {
          background: #fbfbfb;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          margin-top: 7px;
          padding: 8px 25px;
          .content-title {
            color: #152c5b;
            font-weight: bold;
            line-height: 30px;
          }
          .content-text {
            color: #717f9d;
            line-height: 24px;
          }
        }
      }
      .send-time {
        display: flex;
        flex-direction: column;
        flex: 1;
        row-gap: 8px;
        .weeks {
          display: flex;
        }
        .time {
          display: flex;
        }
      }
      .message-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        row-gap: 8px;
        .choose {
          display: flex;
          height: 30px;
          align-items: center;
        }
        .textarea {
          background: #fbfbfb;
          border-radius: 10px;
        }
      }
    }
  }
  .dialog-footer {
    display: flex;
    justify-content: space-between;
    .footer-button {
      flex: auto;
      display: flex;
      justify-content: flex-end;
    }
  }
</style>
