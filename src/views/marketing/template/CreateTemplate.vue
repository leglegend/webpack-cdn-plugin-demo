<template>
  <el-dialog v-model="showDialog" title="新建消息模板" width="40%" append-to-body>
    <template #default>
      <el-form ref="formRef" :model="newTemplate" class="create-rule">
        <div class="rule-item">
          <div class="title">模板名称</div>
          <el-form-item
            prop="tempName"
            :rules="[
              { required: true, message: '请输入模板名称' },
              { max: 10, message: '模板名称最长10个字符' }
            ]"
          >
            <el-input v-model="newTemplate.tempName"></el-input>
          </el-form-item>
        </div>
        <div class="rule-item">
          <div class="title">消息内容</div>
          <div class="message-content">
            <div class="textarea">
              <el-form-item
                prop="tempInfo"
                :rules="[
                  { required: true, message: '请输入消息内容' },
                  { max: 100, message: '模板名称最长100个字符' }
                ]"
              >
                <el-input
                  v-model="newTemplate.tempInfo"
                  type="textarea"
                  placeholder="输入消息内容..."
                ></el-input>
              </el-form-item>
              <MessageType v-model:messages="newTemplate.attachments" />
            </div>
          </div>
        </div>
      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-show="props.template" link type="danger" @click="onDelete" :disabled="loading">
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
</template>
<script setup lang="ts">
  import MessageType from '@/components/MessageType.vue'
  import { Message } from 'api/Message'
  import { WorkWeChatMsgTemplateViewModel } from 'model'
  import { deepClone } from '@/utils'
  import { FormInstance } from 'element-plus'
  import { useTemplateStore } from '@/store'

  const props = defineProps<{
    modelValue: boolean
    template?: WorkWeChatMsgTemplateViewModel | null
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
  }>()

  let showDialog = $computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })
  watch(
    () => props.modelValue,
    () => {
      if (!props.modelValue) return
      formRef?.resetFields()
      if (props.template) {
        nextTick(() => (newTemplate = deepClone(props.template as WorkWeChatMsgTemplateViewModel)))
      } else {
        newTemplate = { attachments: [] }
      }
    }
  )

  const formRef = $ref<FormInstance>()
  const messageApi = new Message()
  const { getTemplatesList } = useTemplateStore()
  let newTemplate = $ref<WorkWeChatMsgTemplateViewModel>({})

  let loading = $ref(false)
  async function onSave() {
    if ((await formRef.validate()) === false) return
    loading = true
    ;(props.template ? messageApi.editWorkWeChatMsgTemplate : messageApi.addWorkWeChatMsgTemplate)(
      newTemplate
    )
      .then(() => {
        ElMessage.success('保存成功')
        showDialog = false
        getTemplatesList(true)
      })
      .finally(() => (loading = false))
  }
  function onDelete() {
    loading = true
    messageApi
      .deleteWorkWeChatMsgTemplate({ id: newTemplate.id })
      .then(() => {
        ElMessage.success('删除成功')
        showDialog = false
        getTemplatesList(true)
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
      .message-content {
        display: flex;
        flex-direction: column;
        flex: 1;
        row-gap: 8px;
        .textarea {
          background: #fbfbfb;
          border-radius: 10px;
          .el-textarea {
            background: #fbfbfb;
            --el-fill-color-blank: #fbfbfb;
          }
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
