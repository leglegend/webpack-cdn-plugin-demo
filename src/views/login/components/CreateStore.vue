<template>
  <div class="content-right">
    <div class="auth-box create-store">
      <div class="title">创建门店</div>
      <el-form ref="formRef" :model="store">
        <div class="item">
          <div class="name">店铺LOGO</div>
          <el-form-item prop="storeLogo" :rules="[{ required: true, message: '请上传店铺LOGO' }]">
            <UploadFile :type="0" :file-type="0" cropper @done="onLogoChange">
              <div class="choose-logo" v-if="store.storeLogo">
                <img class="logo" :src="store.storeLogo" />
                <div class="choose">点击更换</div>
              </div>
              <div class="choose-logo" v-else>
                <div class="logo"></div>
                <div class="choose">点击添加</div>
              </div>
            </UploadFile>
          </el-form-item>
        </div>
        <div class="item">
          <div class="name">店铺名称</div>
          <el-form-item prop="storeName" :rules="[{ required: true, message: '请填写店铺名称' }]">
            <el-input v-model="store.storeName" size="large"></el-input>
          </el-form-item>
        </div>
        <div class="item">
          <div class="name">所属行业</div>
          <el-form-item prop="storeTypeId" :rules="[{ required: true, message: '请选择店铺行业' }]">
            <el-select size="large" v-model="store.storeTypeId" placeholder="选择行业">
              <el-option
                v-for="(type, index) in storeTypes"
                :key="index"
                :value="type.storeTypeId"
                :label="type.storeTypeName"
              >
                {{ type.storeTypeName }}
              </el-option>
            </el-select>
          </el-form-item>
        </div>
      </el-form>
      <div class="button">
        <el-button type="primary" round size="large" @click="onSubmit">开始使用</el-button>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import UploadFile from '@/components/UploadFile.vue'
  import { Store } from 'api/Store'
  import { FormInstance } from 'element-plus'
  import { BusinessSetStoreInfoRequestModel, StoreType } from 'model'
  import router from '@/router'
  import { useUserStore } from '@/store'

  const storeApi = new Store()
  const formRef = $ref<FormInstance>()

  let storeTypes = $ref<StoreType[]>()
  storeApi.getStoreType({}).then(res => {
    if (res.data?.storeTypes) storeTypes = res.data?.storeTypes
  })

  const store = $ref<BusinessSetStoreInfoRequestModel>({})
  function onLogoChange(e: any) {
    console.log(e)
    store.storeLogo = e.url
    formRef.validateField('storeLogo')
  }
  function onSubmit() {
    //
    formRef.validate(valid => {
      if (valid) {
        storeApi.businessSetStoreInfo(store).then(res => {
          useUserStore().updateFill(false)
          router.push('/')
        })
      }
      return valid
    })
  }
</script>
