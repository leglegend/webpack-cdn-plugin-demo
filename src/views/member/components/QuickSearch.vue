<template>
  <el-dialog v-model="showDialog" title="快速搜索管理" width="40%" append-to-body>
    <template #default>
      <div class="quick-search">
        <div class="search-item" v-for="(item, index) in conditions" :key="item.id">
          <div class="item-option">
            <el-input v-model="item.conditionTitle" @blur="onEdit(item)"></el-input>
            <div class="option-right">
              <el-checkbox
                v-model="item.isShare"
                @change="onEdit(item)"
                label="该搜索对所有人可见"
              />
              <el-popover :visible="current === index" trigger="click" placement="top" :width="200">
                <p>删除后无法恢复，是否删除？</p>
                <div style="text-align: right; margin: 0">
                  <el-button size="small" text @click="current = -1">取消</el-button>
                  <el-button size="small" type="primary" @click="onDelete(item, index)">
                    确认
                  </el-button>
                </div>
                <template #reference>
                  <icon-svg name="delete" size="17" color="#2D3584" @click="current = index" />
                </template>
              </el-popover>
            </div>
          </div>
          <div class="item-content">
            {{ item.conditionDescribe }}
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <el-button @click="showDialog = false">取消</el-button>
      <el-button type="primary" @click="onConfirm()">确认</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import { GetUserSearchConditionListResponseModel } from 'model'
  import { deepClone, isEqual } from '@/utils'
  import { User } from 'api/User'
  import { useConditionStore } from '@/store'

  const { getConditionList } = useConditionStore()
  const props = defineProps<{
    modelValue: boolean
    conditions: GetUserSearchConditionListResponseModel[]
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
    (e: 'refresh'): void
  }>()

  let current = $ref(-1)
  let conditions = $ref<GetUserSearchConditionListResponseModel[]>([])
  let showDialog = $computed({
    get() {
      if (props.modelValue && !props.conditions.length) {
        ElMessage.warning('快速搜索为空')
        emit('update:modelValue', false)
        return false
      }
      if (props.modelValue) conditions = deepClone(props.conditions)
      return props.modelValue
    },
    set() {
      operates.clear()
      current = -1
      emit('update:modelValue', false)
    }
  })

  const operates = new Map<GetUserSearchConditionListResponseModel, 'edit' | 'delete'>()
  const userApi = new User()

  function onDelete(item: GetUserSearchConditionListResponseModel, index: number) {
    conditions.splice(index, 1)
    operates.set(item, 'delete')
    current = -1
  }

  function onEdit(item: GetUserSearchConditionListResponseModel) {
    const source = props.conditions.filter(source => source.id === item.id)
    if (source.length && isEqual(source[0], item)) {
      operates.delete(item)
    } else {
      operates.set(item, 'edit')
    }
  }

  function onConfirm() {
    const promises = []
    for (const [item, operate] of operates) {
      if (operate === 'delete') {
        promises.push(
          userApi.editUserSearchConditionState({
            id: item.id,
            state: -1
          })
        )
      } else {
        promises.push(
          userApi.editUserSearchCondition({
            id: item.id,
            conditionTitle: item.conditionTitle,
            isShare: item.isShare
          })
        )
      }
    }

    Promise.all(promises).then(() => {
      ElMessage.success('操作成功')
      showDialog = false
      getConditionList(true)
    })
  }
</script>
<style lang="scss" scoped>
  .quick-search {
    .search-item {
      padding-bottom: 15px;
      .item-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 50px;
        .el-input {
          width: 220px;
        }
        .option-right {
          display: flex;
          align-items: center;
          .icon-svg {
            margin-left: 19px;
            cursor: pointer;
          }
        }
      }
      .item-content {
        width: 100%;
        min-height: 56px;
        line-height: 25px;
        background-color: #f8f8f8;
        font-size: 14px;
        color: #152c5b;
        box-sizing: border-box;
        padding: 10px 20px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
      }
    }
  }
</style>
