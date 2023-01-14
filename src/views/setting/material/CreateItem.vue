<template>
  <el-dialog v-model="showDialog" title="添加自定义信息项" width="40%" append-to-body>
    <template #default>
      <el-form ref="formRef" :model="newItem" class="create-item">
        <div class="tag-item">
          <div class="title">名字</div>
          <div class="content">
            <div class="row">
              <el-form-item
                prop="controlInstructions"
                :rules="[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入名称'
                  },
                  {
                    max: 10,
                    message: '名称最长10个字'
                  }
                ]"
              >
                <el-input v-model="newItem.controlInstructions" />
              </el-form-item>
              <div class="icon">
                <icon-svg name="remove" color="#ffffff"></icon-svg>
              </div>
            </div>
          </div>
        </div>
        <div class="tag-item">
          <div class="title">类型</div>
          <div class="content">
            <el-form-item prop="controlType">
              <el-radio-group v-model="newItem.controlType" @change="onRadioChange">
                <el-radio label="input">输入</el-radio>
                <el-radio label="select">固定选项</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </div>
        <div class="tag-item" v-if="newItem.controlType === 'select'">
          <div class="title" draggable>选项</div>

          <div class="content">
            <div class="row" v-for="(item, index) in newItem.items" :key="index">
              <el-form-item
                :prop="'items.' + index + '.itemName'"
                :rules="[{ required: true, message: '请输入选项名称' }]"
              >
                <el-input v-model="item.itemName" />
              </el-form-item>

              <div class="icon" @click="onRemove(index)">
                <icon-svg name="remove"></icon-svg>
              </div>
            </div>
            <div class="row" key="btn">
              <el-button round size="small" @click="onAddItem">
                <template #icon>
                  <icon-svg name="add" size="13" color="#409EFF"></icon-svg>
                </template>
                添加标签
              </el-button>
            </div>
          </div>
        </div>
        <el-form-item prop="isShow">
          <el-checkbox v-model="newItem.isShow">该信息项仅用于商家管理，不对会员展示</el-checkbox>
        </el-form-item>
      </el-form>
    </template>
    <template #footer>
      <div class="dialog-footer">
        <el-button link type="danger" v-if="props.current" @click="onDelete">
          <template #icon>
            <icon-svg name="delete"></icon-svg>
          </template>
          删除该信息项
        </el-button>
        <div class="footer-button">
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="onSave">保存</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { BusinessAddCustomControlsRequestModel, CustomControlsViewModel } from 'model'
  import { CustomControls } from '@/api/generated/CustomControls'
  import { FormInstance } from 'element-plus'
  import { deepClone } from '@/utils'

  interface AddCustomControls extends Omit<BusinessAddCustomControlsRequestModel, 'controlType'> {
    controlType: 'select' | 'input'
    id?: number
  }

  const props = defineProps<{
    modelValue: boolean
    current?: CustomControlsViewModel | undefined | null
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'refresh'): void
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
      newItem = { controlType: 'input' }
      if (props.current) {
        nextTick(() => (newItem = deepClone(props.current as AddCustomControls)))
      }
    }
  )

  let newItem = $ref<AddCustomControls>()

  const customControlsApi = new CustomControls()

  const formRef = $ref<FormInstance>()

  function onRadioChange() {
    if (newItem.controlType === 'input') {
      delete newItem.items
    } else {
      newItem.items = [{}]
    }
  }

  function onSave() {
    formRef.validate(valid => {
      if (valid) {
        if (props.current) {
          customControlsApi.businessUpdateCustomControls(newItem).then(res => {
            emit('refresh')
            showDialog = false
            ElMessage.success('修改成功')
          })
        } else {
          customControlsApi.businessAddCustomControls(newItem).then(res => {
            emit('refresh')
            showDialog = false
            ElMessage.success('保存成功')
          })
        }
      }
    })
  }

  function onDelete() {
    customControlsApi.businessDelCustomControls(newItem).then(() => {
      emit('refresh')
      showDialog = false
      ElMessage.success('删除成功')
    })
  }

  function onAddItem() {
    if (newItem.items) newItem.items.push({})
  }

  function onRemove(index: number) {
    if (newItem.items && newItem.items?.length > 1) {
      newItem.items.splice(index, 1)
    } else {
      ElMessage.warning('最少保留一个选项')
    }
  }
</script>
<style lang="scss" scoped>
  .create-item {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    .tag-item {
      display: flex;
      .title {
        flex: none;
        width: 70px;
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
          .el-form-item {
            flex: auto;
          }
          .icon {
            height: 30px;
            display: flex;
            align-items: center;
            flex: none;
            cursor: pointer;
            fill: #8995ad;
            font-size: 18px;
            width: 18px;
          }
          .sort {
            cursor: move;
          }
        }
      }

      &:last-child {
        padding-bottom: 100px;
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
