<template>
  <el-dialog
    v-model="showDialog"
    :title="props.member ? '编辑会员' : '新增会员'"
    width="40%"
    append-to-body
  >
    <template #default>
      <el-form ref="formRef" :model="member" class="create-content">
        <div class="create-item">
          <div class="title">
            <span class="request">*</span>
            <span class="text">手机号</span>
          </div>
          <div class="content">
            <el-form-item
              prop="userMobile"
              :rules="[
                {
                  required: true,
                  whitespace: true,
                  message: '请输入手机号'
                },
                {
                  max: 11,
                  message: '手机号最长11个字'
                }
              ]"
            >
              <el-input v-model="member.userMobile" :disabled="!!props.member" />
            </el-form-item>
          </div>
        </div>
        <div
          class="create-item"
          v-for="(item, index) in member.userInfos"
          :key="(item.controlName as string)"
        >
          <div class="title">
            <span v-visible="item.isMust" class="request">*</span>
            <span class="text">{{ item.controlInstructions }}</span>
          </div>
          <div class="content">
            <el-form-item :prop="'userInfos.' + index + '.controlValue'" :rules="calcRules(item)">
              <el-input v-if="item.controlType === 'input'" v-model="item.controlValue" />
              <el-select v-else-if="item.controlType === 'select'" v-model="item.controlValue">
                <el-option
                  v-for="option in item.items"
                  :key="option.id"
                  :label="option.itemName!"
                  :value="option.itemValue!"
                />
              </el-select>
              <el-radio-group v-else-if="item.controlType === 'radio'" v-model="item.controlValue">
                <el-radio v-for="option in item.items" :key="option.id" :label="option.itemValue!">
                  {{ option.itemName }}
                </el-radio>
              </el-radio-group>
              <el-date-picker
                value-format="YYYY-MM-DD"
                v-else-if="item.controlType === 'date'"
                v-model="item.controlValue"
              ></el-date-picker>
              <UploadFile
                v-else-if="item.controlType === 'img'"
                :type="0"
                :file-type="0"
                @done="onImgChange($event, item, index)"
              >
                <img class="item-img" v-if="item.controlValue" :src="item.controlValue" />
                <div class="add-img" v-else>
                  <img src="@/assets/create_member_img.png" />
                </div>
              </UploadFile>
            </el-form-item>
          </div>
        </div>

        <div class="create-item">
          <div class="title">
            <span v-visible="false" class="request">*</span>
            标签
          </div>
          <div class="content">
            <el-checkbox-group v-model="member.tags">
              <template v-for="item in tagListFlat">
                <el-checkbox v-if="item" :key="item.id" :label="(item.id as number)">
                  <div style="display: flex; align-items: center; gap: 5px">
                    <icon-svg
                      v-if="item.tagIcon"
                      name="flag"
                      size="20px"
                      :color="(item.tagIcon as string)"
                    ></icon-svg>
                    {{ item.tagName }}
                  </div>
                </el-checkbox>
              </template>
            </el-checkbox-group>
          </div>
        </div>
      </el-form>
    </template>
    <template #footer>
      <el-button @click="showDialog = false" :disabled="loading">取消</el-button>
      <el-button type="primary" @click="onSave" :loading="loading">保存</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
  import UploadFile from '@/components/UploadFile.vue'
  import { User } from 'api/User'
  import { CustomControls } from 'api/CustomControls'
  import {
    CreateUserRequestModel,
    StoreUserControlsViewModel,
    GetUserInfoResponseModel,
    StoreUserSimpleViewModel
  } from 'model'
  import { FormInstance } from 'element-plus'
  import { useTagStore, useEventStore } from '@/store'
  import { deepClone } from '@/utils'
  import { vVisible } from '@/utils/directives'

  const props = defineProps<{
    modelValue: boolean
    loading: boolean
    member?: GetUserInfoResponseModel | null
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
      await tagStore.getTagList()
      if (!controls) {
        await customControlsApi.businessGetStoreControls({}).then(res => {
          if (res.data?.controls) controls = res.data?.controls
        })
      }
      if (props.member) {
        member = {
          userId: props.member!.userId,
          cardId: props.member!.cardId,
          userMobile: props.member!.userMobile,
          userInfos: calcUserInfos(deepClone(controls), props.member!.storeUserInfo!),
          tags: props.member!.groups?.map(item => item.groupId!)
        }
      } else {
        member = {
          userInfos: deepClone(controls)
        }
      }
      emit('update:loading', false)
    }
  )

  // #region API/类型定义/ref
  const customControlsApi = new CustomControls()
  const userApi = new User()

  interface Controls extends StoreUserControlsViewModel {
    controlValue?: string
  }
  interface Member extends Omit<CreateUserRequestModel, 'tags' | 'userInfos'> {
    tags?: number[]
    groupIds?: number[]
    cardId?: number
    userInfos?: Controls[]
  }

  const formRef = $ref<FormInstance>()
  // #endregion

  // #region 会员标签
  const tagStore = useTagStore()
  const tagListFlat = $computed(() => {
    return tagStore.tagList.flatMap(item => item.tags)
  })
  // #endregion

  let controls = $ref<Controls[]>()
  let member = $ref<Member>({})
  let loading = $ref(false)

  function calcRules(item: Controls) {
    const rules = []
    if (item.isMust) {
      rules.push({
        required: true,
        whitespace: true,
        message: item.controlInstructions + '为必填'
      })
    }
    return rules
  }
  function calcUserInfos(controls: Controls[], userInfos: StoreUserSimpleViewModel[]): Controls[] {
    const map = new Map()
    userInfos.forEach(item => map.set(item.controlName, item.controlValue))
    controls.forEach(item => (item.controlValue = map.get(item.controlName)))
    return controls
  }
  function onImgChange(file: any, item: Controls, index: number) {
    item.controlValue = file.url
    formRef.validateField('userInfos.' + index + '.controlValue')
  }
  function onSave() {
    formRef.validate(valid => {
      if (valid) {
        const params = deepClone(member)
        params.userInfos = params.userInfos?.map(item => ({
          controlName: item.controlName,
          controlValue: item.controlValue
        }))
        if (props.member) {
          params.groupIds = params.tags
          delete params.tags
        }
        loading = true
        ;(props.member ? userApi.editUserInfo : userApi.createUser)(params)
          .then(() => {
            ElMessage.success('保存成功')
            showDialog = false
            emit('refresh')
          })
          .finally(() => {
            loading = false
          })
      }
    })
  }
</script>
<style lang="scss" scoped>
  .create-content {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    .create-item {
      display: flex;
      .title {
        flex: none;
        width: 100px;
        height: 30px;
        color: #152c5b;
        font-weight: bold;
        font-size: 16px;
        display: flex;
        align-items: center;
        .request {
          color: #ff0000;
        }
        .text {
          line-height: 20px;
        }
      }
      .content {
        flex: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        position: relative;
        .el-select {
          width: 100%;
        }
        .item-img {
          height: 60px;
        }
        .add-img {
          width: 51px;
          height: 51px;
          background: #fbfbfb;
          border: 1px solid #f1f3f8;
          border-radius: 5px;
          img {
            width: 29px;
            height: 24px;
          }
        }
        :deep(.el-date-editor) {
          --el-date-editor-width: 100%;
        }
      }
    }
  }
</style>
