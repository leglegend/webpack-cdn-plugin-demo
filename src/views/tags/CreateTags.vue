<template>
  <el-dialog v-model="showDialog" :title="tag ? '编辑标签' : '新建标签'" width="40%" append-to-body>
    <template #default>
      <el-form class="create-tag" ref="formRef" :model="newTag">
        <div class="tag-item">
          <div class="title">标签组名称</div>
          <div class="content">
            <div class="row">
              <el-form-item
                prop="tagGroupName"
                :rules="[
                  { required: true, message: '请填写标签组名称' },
                  { max: 10, message: '长度不能超过10个字符' }
                ]"
              >
                <el-input v-model="newTag.tagGroupName" />
              </el-form-item>
              <template v-if="newTag.tagType != 1">
                <icon-svg name="sort" size="23" color="#ffffff"></icon-svg>
                <icon-svg name="remove" size="18" color="#ffffff"></icon-svg>
              </template>
            </div>
          </div>
        </div>
        <div class="tag-item">
          <div class="title" draggable>标签</div>

          <div class="content">
            <div
              class="row"
              :draggable="draggable"
              @dragenter="onDragenter($event, index)"
              @dragover="onDragover($event, index)"
              @dragstart="onDragstart(index)"
              v-for="(item, index) in newTag?.tags"
              :key="index"
            >
              <div class="flag" v-if="newTag.tagType == 1">
                <icon-svg name="flag" size="20px" :color="(item.tagIcon as string)"></icon-svg>
              </div>
              <el-form-item :prop="'tags.' + index + '.tagName'" :rules="rules">
                <el-input v-model="item.tagName" />
              </el-form-item>
              <template v-if="newTag.tagType != 1">
                <div class="icon sort" @mouseover="draggable = true" @mouseout="draggable = false">
                  <icon-svg name="sort" size="23"></icon-svg>
                </div>
                <div class="icon" @click="onRemove(index)">
                  <icon-svg name="remove" size="18"></icon-svg>
                </div>
              </template>
            </div>
            <div class="row" key="btn" v-if="newTag.tagType != 1">
              <el-button round size="small" @click="onAddTag">
                <template #icon>
                  <icon-svg name="add" size="13" color="#409EFF"></icon-svg>
                </template>
                添加标签
              </el-button>
            </div>
          </div>
        </div>
      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button
          v-if="tag && tag.tagType !== 1"
          link
          type="danger"
          :disabled="loading"
          @click="onDelete"
        >
          <template #icon>
            <icon-svg name="delete"></icon-svg>
          </template>
          删除该标签
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
  import { deepClone } from '@/utils'
  import { StoreTag } from 'api/StoreTag'
  import { FormInstance } from 'element-plus'
  import type { StoreTagViewModel } from 'model'

  const props = defineProps<{
    modelValue: boolean
    tag: StoreTagViewModel | undefined
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'refresh', refresh?: boolean): void
  }>()
  let showDialog = $computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  })

  watch(
    () => props.modelValue,
    () => {
      if (!props.modelValue) return
      formRef?.clearValidate()
      if (props.tag) nextTick(() => (newTag = deepClone(props.tag!)))
      else newTag = { tags: [{}] }
    }
  )

  interface Rule {
    required?: boolean
    message?: string
    max?: number
  }
  const rules = computed(() => {
    const rules: Rule[] = [{ max: 10, message: '长度不能超过10个字符' }]
    if (newTag.tagType !== 1) rules.push({ required: true, message: '请填写标签名称' })
    return rules
  })

  // #region 操作
  const formRef = $ref<FormInstance>()
  const storeTagApi = new StoreTag()
  let newTag = $ref<StoreTagViewModel>({ tags: [{}] })
  let loading = $ref(false)

  function onAddTag() {
    if (newTag.tags) {
      newTag.tags.push({})
    } else {
      newTag.tags = [{}]
    }
  }
  function onRemove(index: number) {
    if (!newTag.tags || newTag.tags.length === 1) return ElMessage.warning('最少保留一个标签')
    newTag.tags?.splice(index, 1)
  }
  function onSubmit() {
    if (!formRef) return
    formRef.validate(valid => {
      if (!newTag.tags || newTag.tags.length === 0) return ElMessage.warning('最少保留一个标签')
      if (valid && props.tag) {
        doEdit()
      } else if (valid) {
        doSave()
      } else {
        return false
      }
    })
  }

  function onDelete() {
    storeTagApi
      .deleteStoreTag({
        id: newTag.id
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
    storeTagApi
      .addStoreTag(newTag)
      .then(res => {
        ElMessage.success('保存成功')
        showDialog = false
        emit('refresh', true)
      })
      .finally(() => (loading = false))
  }
  function doEdit() {
    loading = true
    storeTagApi
      .editStoreTag(newTag)
      .then(res => {
        ElMessage.success('编辑成功')
        showDialog = false
        emit('refresh', true)
      })
      .finally(() => (loading = false))
  }
  // #endregion

  // #region 排序
  const draggable = $ref(false)
  let dragIndex = $ref(1)

  function onDragstart(index: number) {
    dragIndex = index
  }
  function onDragenter(e: any, index: number) {
    e.preventDefault()
    // 避免源对象触发自身的dragenter事件
    if (dragIndex !== index && newTag.tags) {
      const source = newTag.tags[dragIndex]
      newTag.tags.splice(dragIndex, 1)
      newTag.tags.splice(index, 0, source)
      // 排序变化后目标对象的索引变成源对象的索引
      dragIndex = index
    }
  }
  function onDragover(e: any, index: number) {
    e.preventDefault()
  }
  // #endregion
</script>
<style lang="scss" scoped>
  .create-tag {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    user-select: none;
    .tag-item {
      display: flex;
      .title {
        flex: none;
        width: 100px;
        line-height: 30px;
        color: #152c5b;
        font-weight: bold;
        font-size: 16px;
      }
      .content {
        flex: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;

        .row {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          .flag {
            flex: none;
            height: 30px;
            display: flex;
            align-items: center;
          }
          .el-form-item {
            flex: auto;
          }
          .icon {
            flex: none;
            cursor: pointer;
            fill: #8995ad;
            height: 30px;
            display: flex;
            align-items: center;
          }
          .sort {
            cursor: move;
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
