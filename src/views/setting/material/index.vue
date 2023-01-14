<template>
  <div class="member-material">
    <div class="top-bar">
      <div class="title">
        <icon-svg name="warn" color="#0075FF" size="24"></icon-svg>
        设置会员入会时需要填写的信息，避免设置过多，引起会员反感
      </div>
    </div>
    <el-row :gutter="17">
      <el-col :span="19">
        <div class="content">
          <div class="title">填写设置</div>
          <div class="table-title">
            <div class="auto">信息项</div>
            <div class="auto">类型</div>
            <div class="auto">是否必填</div>
            <div class="none">排序</div>
          </div>
          <div class="table-item">
            <div class="auto primary">
              <div class="primary-name">
                <span class="requried">*</span>
                手机号
              </div>
            </div>
            <div class="auto">输入</div>
            <div class="auto">
              <el-checkbox label="必填" disabled checked></el-checkbox>
            </div>
            <div class="none disable">
              <icon-svg name="sort" color="#8995AD" size="25" />
            </div>
          </div>
          <div
            class="table-item"
            :draggable="draggable"
            @dragenter="onDragenter($event, index)"
            @dragover="onDragover($event, index)"
            @dragstart="onDragstart(index)"
            v-for="(item, index) in storeControls"
            :key="index"
          >
            <div class="auto primary">
              <div class="primary-name">
                <span v-if="item.isMust" class="requried">*</span>
                {{ item.controlInstructions }}
              </div>
              <div class="hidden" v-if="!item.isShow">(不对会员展示)</div>
            </div>
            <div class="auto">
              {{ doCalcTypeName(item.controlType!) }}
            </div>
            <div class="auto">
              <el-checkbox
                label="必填"
                :checked="!!item.isMust"
                @change="onRequiredChange(item)"
              ></el-checkbox>
            </div>
            <div class="none" @mouseover="draggable = true" @mouseout="draggable = false">
              <icon-svg name="sort" color="#8995AD" size="25" />
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="5">
        <div class="items">
          <div class="title">填写设置</div>
          <div class="list">
            <div class="lits-item">
              <div class="name">
                <span class="text">*</span>
                手机号
              </div>
              <div class="check">
                <el-checkbox :checked="true" disabled />
              </div>
            </div>
            <div class="lits-item" v-for="(item, index) in publicControls" :key="index">
              <div class="name">
                <span class="text" v-if="item.isMust">*</span>
                {{ item.controlInstructions }}
              </div>
              <div class="check">
                <el-checkbox
                  :checked="isChecked(item.controlName as string)"
                  @change="onStateChange(item, isChecked(item.controlName as string))"
                />
              </div>
            </div>
            <div v-if="privateControls.length" class="list-line">
              <div></div>
              以下信息仅供商家管理使用
              <div></div>
            </div>
            <div class="lits-item" v-for="(item, index) in privateControls" :key="index">
              <div class="name">{{ item.controlInstructions }}</div>
              <div class="check">
                <el-checkbox
                  :checked="isChecked(item.controlName as string)"
                  @change="onStateChange(item, isChecked(item.controlName as string))"
                />
              </div>
              <div class="edit" @click="onEdit(item)">
                <icon-svg name="edit" size="18px" color="#0075FF"></icon-svg>
              </div>
            </div>
            <el-button round plain type="primary" size="large" @click="onCreate">
              <template #icon>
                <icon-svg name="add"></icon-svg>
              </template>
              添加自定义项目
            </el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    <CreateItem v-model="showDialog" :current="currentItem" @refresh="doRefresh" />
  </div>
</template>
<script setup lang="ts" name="MaterialSetting">
  import CreateItem from './CreateItem.vue'
  import { CustomControls } from '@/api/generated/CustomControls'
  import {
    CustomControlsViewModel,
    StoreControlsViewModel,
    BusinessSetCustomControlsRequestModel
  } from 'model'
  import { deepClone } from '@/utils'

  const customControlsApi = new CustomControls()
  let showDialog = $ref(false)

  let customControls = $ref<CustomControlsViewModel[]>([])
  let storeControls = $ref<StoreControlsViewModel[]>([])

  const publicControls = $computed(() => {
    return customControls.filter(item => item.storeId === 0)
  })
  const privateControls = $computed(() => {
    return customControls.filter(item => item.storeId !== 0)
  })

  const isChecked = $computed(() => {
    return (controlName: string): boolean => {
      return !!storeControls.find(item => item.controlName === controlName)
    }
  })

  let currentItem: CustomControlsViewModel | null = $ref(null)

  function onCreate() {
    currentItem = null
    showDialog = true
  }

  function onEdit(item: CustomControlsViewModel) {
    currentItem = item
    showDialog = true
  }

  function doCalcTypeName(type: string) {
    switch (type) {
      case 'input':
        return '输入'
      case 'select':
      case 'checkbox':
      case 'radio':
        return '选项'
      case 'img':
        return '图片'
      case 'date':
        return '日期'
    }
  }

  async function doRefresh() {
    return await customControlsApi.businessGetCustomControls({}).then(res => {
      if (res.data?.customControls) customControls = res.data.customControls
      if (res.data?.storeControls) storeControls = res.data.storeControls
    })
  }
  doRefresh()

  function onRequiredChange(item: StoreControlsViewModel) {
    item.isMust = item.isMust ? 0 : 1
    const data: BusinessSetCustomControlsRequestModel = item
    data.state = 1
    customControlsApi.businessSetCustomControls(data)
  }

  function onStateChange(item: CustomControlsViewModel, state: boolean) {
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    const data: BusinessSetCustomControlsRequestModel = deepClone(item)
    data.state = state ? 0 : 1
    data.cid = item.id
    customControlsApi
      .businessSetCustomControls(data)
      .then(() => doRefresh())
      .finally(() => loading.close())
  }

  // #region 排序
  const draggable = $ref(false)
  let dragIndex = $ref(1)

  function onDragstart(index: number) {
    dragIndex = index
  }
  function onDragenter(e: any, index: number) {
    e.preventDefault()
    // 避免源对象触发自身的dragenter事件
    if (dragIndex !== index && storeControls) {
      const source = storeControls[dragIndex]
      storeControls.splice(dragIndex, 1)
      storeControls.splice(index, 0, source)
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
  .member-material {
    padding-bottom: 20px;
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
          margin-right: 6px;
        }
      }
    }
    .content {
      border-radius: 20px;
      background: #ffffff;
      .title {
        text-align: center;
        line-height: 46px;
        font-weight: bold;
        color: #152c5b;
      }
      .table-title {
        line-height: 60px;
        background: #f8fbfd;
        font-weight: bold;
        color: #152c5b;
        display: flex;
        padding: 0px 30px 0 60px;
        .auto {
          flex: auto;
          &:nth-child(1) {
            width: 100px;
          }
          &:nth-child(2) {
            width: 200px;
          }
          &:nth-child(3) {
            width: 100px;
          }
        }
        .none {
          width: 70px;
          flex: none;
          display: flex;
          justify-content: center;
          cursor: pointer;
        }
        .disable {
          opacity: 0.1;
        }
      }
      .table-item {
        height: 79px;
        padding: 0px 30px 0 60px;
        display: flex;
        color: #717f9d;
        font-size: 14px;
        .auto {
          flex: auto;
          display: flex;
          align-items: center;
          &:nth-child(1) {
            width: 100px;
          }
          &:nth-child(2) {
            width: 200px;
          }
          &:nth-child(3) {
            width: 100px;
          }
        }
        .none {
          width: 70px;
          flex: none;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
        }
        .primary {
          color: #152c5b;
          font-weight: bold;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          .primary-name {
            .requried {
              color: #ff0000;
            }
          }

          .hidden {
            font-weight: lighter;
            color: #717f9d;
          }
        }
      }
    }
    .items {
      background: #c0d8f470;
      border-radius: 20px;
      padding: 0 5px 7px;
      .title {
        text-align: center;
        line-height: 46px;
        font-weight: bold;
        color: #152c5b;
      }
      .list {
        background: #f8fbfd;
        border-radius: 0px 0px 20px 20px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        .lits-item {
          height: 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          .name {
            color: #152c5b;
            font-size: 14px;
            font-weight: bold;
            flex: auto;
            .text {
              color: #ff0000;
            }
          }
          .check {
            flex: none;
            width: 30px;
          }
          .edit {
            flex: none;
            width: 30px;
            cursor: pointer;
          }
        }
        .list-line {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 50px;
          font-size: 14px;
          font-weight: 400;
          color: #152c5b;
          div {
            height: 1px;
            width: 23px;
            background: #8995ad;
          }
        }
      }
    }
  }
</style>
