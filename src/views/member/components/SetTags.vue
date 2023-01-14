<template>
  <el-dialog v-model="showDialog" title="批量打标签" append-to-body>
    <template #default>
      <div v-for="tag in tagStore.tagList" :key="tag.id">
        <div class="item-title">{{ tag.tagGroupName }}</div>
        <el-checkbox-group v-model="tagIds">
          <el-checkbox v-for="item in tag.tags" :key="item.id" :label="(item.id as number)">
            <div style="display: flex; align-items: center; gap: 5px">
              <icon-svg
                v-if="tag.tagType === 1"
                name="flag"
                size="20px"
                :color="(item.tagIcon as string)"
              ></icon-svg>
              {{ item.tagName }}
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button link type="primary" :disabled="loading" @click="onNavigate">
          <template #icon>
            <icon-svg name="delete"></icon-svg>
          </template>
          去管理标签
        </el-button>
        <div class="footer-button">
          <el-button @click="showDialog = false" :disabled="loading">取消</el-button>
          <el-button type="primary" :loading="loading" @click="onSave">保存</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
  import router from '@/router'
  import { useTagStore } from '@/store'
  import { User } from 'api/User'

  const props = defineProps<{
    modelValue: boolean
    loading: boolean
    cardIds: number[]
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'update:loading', loading: boolean): void
  }>()
  let showDialog = $computed({
    get: () => props.modelValue && !props.loading,
    set: val => emit('update:modelValue', val)
  })
  watch(
    () => props.modelValue,
    async () => {
      if (!props.modelValue) return
      emit('update:loading', true)
      try {
        tagIds = []
        await tagStore.getTagList()
      } catch (e) {
        showDialog = false
      }
      emit('update:loading', false)
    }
  )

  const tagStore = useTagStore()
  const loading = $ref(false)
  let tagIds = $ref<number[]>()
  const userApi = new User()
  function onSave() {
    userApi
      .batchEditUserTags({
        tags: tagIds,
        cardIds: props.cardIds
      })
      .then(() => {
        ElMessage.success('修改成功')
        showDialog = false
      })
  }
  function onNavigate() {
    showDialog = false
    router.push('/tags')
  }
</script>
<style lang="scss" scoped>
  .item-title {
    color: #152c5b;
    font-weight: bold;
    line-height: 60px;
    font-size: 14px;
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
