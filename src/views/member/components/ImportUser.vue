<template>
  <el-dialog v-model="showDialog" title="导入外部联系人" append-to-body>
    <template #default>
      <div class="import-title">即将导入企业微信添加的外部联系人，</div>
      <div class="import-text">
        导入后即成为会员，可在会员列表中统一管理，可通过客户营销群发消息
      </div>
      <div class="import-info">如果会员已存在，将不会导入重复的外部联系人</div>
    </template>
    <template #footer>
      <el-button @click="showDialog = false" :disabled="loading">取消</el-button>
      <el-button type="primary" :loading="loading" @click="onImport">确定导入</el-button>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
  import { User } from 'api/User'

  const props = defineProps<{
    modelValue: boolean
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
  }>()
  let showDialog = $computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })

  let loading = $ref(false)
  const userApi = new User()
  function onImport() {
    loading = true
    userApi
      .importWorkWeChatUser({})
      .then(res => {
        showDialog = false
        ElMessageBox.alert(`已成功导入${res.data?.userSum}名外部联系人！`, '导入外部联系人', {
          confirmButtonText: '确认',
          callback() {}
        })
      })
      .finally(() => (loading = false))
  }
</script>
<style lang="scss" scoped>
  .import-title {
    font-weight: bold;
    color: #152c5b;
    font-size: 14px;
    line-height: 40px;
  }
  .import-text {
    color: #717f9d;
    line-height: 24px;
    font-size: 14px;
  }
  .import-info {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 27px;
    background: #e6940010;
    border-radius: 14px;
    font-size: 14px;
    color: #e69400;
    margin-top: 15px;
    width: 346px;
  }
</style>
