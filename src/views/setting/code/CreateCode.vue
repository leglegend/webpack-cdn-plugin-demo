<template>
  <el-dialog v-model="showDialog" :title="id ? '编辑活码' : '新建活码'" width="40%" append-to-body>
    <template #default>
      <el-form class="create-code" ref="formRef" :model="newCode">
        <div class="code-item">
          <div class="title">
            <span class="request">*</span>
            活码名称
          </div>
          <div class="content">
            <el-form-item
              prop="codeTitle"
              :rules="[
                { required: true, message: '请填活码名称' },
                { max: 10, message: '长度不能超过10个字符' }
              ]"
            >
              <el-input v-model="newCode.codeTitle" />
            </el-form-item>
          </div>
        </div>
        <div class="code-item">
          <div class="title">
            <span class="request">*</span>
            使用员工
          </div>
          <div class="content">
            <el-form-item prop="staffId" :rules="[{ required: true, message: '请选择员工' }]">
              <el-select v-model="newCode.staffId">
                <el-option
                  v-for="item in staffList"
                  :key="item.id"
                  :value="item.id!"
                  :label="item.userName!"
                ></el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div class="code-item">
          <div class="title">
            <span class="hidden">*</span>
            扫码自动打标签
          </div>
          <div class="content">
            <el-form-item prop="tags">
              <el-select v-model="newCode.tags" multiple>
                <el-option-group
                  v-for="tag in tagStore.tagList"
                  :key="tag.id"
                  :label="tag.tagGroupName!"
                >
                  <el-option
                    v-for="item in tag.tags"
                    :key="item.id"
                    :label="item.tagName!"
                    :value="item.id!"
                  >
                    <template #default>
                      <icon-svg
                        v-if="item.tagIcon"
                        name="flag"
                        size="16"
                        :color="item.tagIcon"
                      ></icon-svg>
                      {{ item.tagName || '' }}
                    </template>
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
          </div>
        </div>

        <div class="code-item">
          <div class="title">
            <span class="hidden">*</span>
            欢迎语
          </div>
          <div class="content">
            <div class="choose">
              （添加客户成功后收到该欢迎语）
              <el-button size="small" link type="primary">预览</el-button>
            </div>
            <div class="textarea">
              <el-form-item
                prop="messageInfo"
                :rules="[{ max: 100, message: '模板名称最长100个字符' }]"
              >
                <el-input
                  v-model="newCode.messageInfo"
                  type="textarea"
                  placeholder="输入消息内容..."
                ></el-input>
              </el-form-item>
              <MessageType v-model:messages="newCode.attachments" />
            </div>
          </div>
        </div>
      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="id" link type="danger" :disabled="loading" @click="onDelete">
          <template #icon>
            <icon-svg name="delete"></icon-svg>
          </template>
          删除该规则
        </el-button>
        <div class="footer-button">
          <el-button @click="showDialog = false" :disabled="loading">取消</el-button>
          <el-button type="primary" :loading="loading" @click="onSubmit">保存</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { useTagStore, useStaffStore } from '@/store'
  import { deepClone } from '@/utils'
  import { WorkWeChatCode } from 'api/WorkWeChatCode'
  import { FormInstance } from 'element-plus'
  import type {
    GetCodeInfoResponseModel,
    WorkWechatStaffCodeTagViewModelModel,
    EditCodeRequestModel
  } from 'model'

  const props = defineProps<{
    modelValue: boolean
    loading: boolean
    id: number | null
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'update:loading', loading: boolean): void
    (e: 'refresh', refresh?: boolean): void
  }>()

  let showDialog = $computed({
    get: () => props.modelValue && !props.loading,
    set: val => emit('update:modelValue', val)
  })
  watch(
    () => props.modelValue,
    () => beforeShow()
  )

  // #region 初始化
  interface NewCode extends Omit<GetCodeInfoResponseModel, 'tags'> {
    tags?: number[]
  }
  async function beforeShow() {
    if (!props.modelValue) return
    formRef?.resetFields()
    emit('update:loading', true)
    await Promise.all([tagStore.getTagList(), staffStore.getStaffList()])
    if (props.id) {
      const res = await workWeChatCodeApi.getCodeInfo({ id: props.id })
      if (res.data) {
        nextTick(() => {
          newCode = res.data as NewCode
          newCode.tags = res.data!.tags?.map(tag => tag.tagId!)
        })
      }
    } else {
      newCode = {}
    }
    emit('update:loading', false)
  }
  // #endregion

  // #region 数据
  const formRef = $ref<FormInstance>()
  const tagStore = useTagStore()
  const workWeChatCodeApi = new WorkWeChatCode()
  let newCode = $ref<NewCode>({})
  let loading = $ref(false)
  const staffStore = useStaffStore()
  const staffList = $computed(() => staffStore.staffList.filter(item => item.isAuthWorkWeChat))
  // #endregion

  // #region 操作
  function onSubmit() {
    if (!formRef) return
    formRef.validate(valid => {
      if (valid && props.id) {
        doEdit()
      } else if (valid) {
        doSave()
      } else {
        return false
      }
    })
  }

  function onDelete() {
    workWeChatCodeApi
      .deleteCode({
        id: newCode.id
      })
      .then(res => {
        ElMessage.success('删除成功')
        showDialog = false
        emit('refresh', true)
      })
      .finally(() => (loading = false))
  }
  function doSave() {
    loading = true
    workWeChatCodeApi
      .addCode(newCode)
      .then(res => {
        ElMessage.success('保存成功')
        showDialog = false
        emit('refresh', true)
      })
      .finally(() => (loading = false))
  }
  interface EditParams extends Omit<GetCodeInfoResponseModel, 'tags'> {
    tags?: number[] | WorkWechatStaffCodeTagViewModelModel[]
  }
  function doEdit() {
    loading = true
    const params: EditParams = deepClone(newCode)
    params.tags = newCode.tags?.map(tag => ({ id: 0, tagId: tag }))
    workWeChatCodeApi
      .editCode(params as EditCodeRequestModel)
      .then(res => {
        ElMessage.success('编辑成功')
        showDialog = false
        emit('refresh', true)
      })
      .finally(() => (loading = false))
  }
  // #endregion
</script>
<style lang="scss" scoped>
  .create-code {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    user-select: none;
    .code-item {
      display: flex;
      .title {
        flex: none;
        width: 150px;
        line-height: 30px;
        color: #152c5b;
        font-weight: bold;
        font-size: 16px;
        .request {
          color: #ff0000;
        }
        .hidden {
          visibility: hidden;
        }
      }
      .content {
        flex: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        .choose {
          display: flex;
          height: 30px;
          align-items: center;
          justify-content: space-between;
          color: #e69400;
          font-size: 12px;
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
