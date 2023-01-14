<template>
  <div class="content-right">
    <div class="auth-box">
      <el-form ref="formRef" :model="mobileInfo">
        <div class="title">授权手机号</div>
        <div class="item">
          <div class="name">手机号</div>
          <el-form-item
            prop="userMobile"
            :rules="[{ required: true, whitespace: true, message: '请填写手机号' }]"
          >
            <el-input size="large" v-model="mobileInfo.userMobile"></el-input>
          </el-form-item>
        </div>
        <div class="item">
          <div class="name">验证码</div>
          <el-form-item
            prop="smsCode"
            :rules="[{ required: true, whitespace: true, message: '请填写验证码' }]"
          >
            <el-input size="large" v-model="mobileInfo.smsCode">
              <template #append>
                <el-button class="code-button" :disabled="codeTimer >= 0" link @click="onGetCode">
                  {{ codeTimer >= 0 ? `剩余${codeTimer}秒` : '获取验证码' }}
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </div>
        <div class="button">
          <el-button type="primary" round size="large" @click="onSubmit" :loading="loading">
            授权
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { User } from '@/api/generated/User'
  import { Common } from 'api/Common'
  import { FormInstance } from 'element-plus'
  import { SetUserMobileViewMobileRequestModel, StoreType } from 'model'
  import router from '@/router'
  import { useUserStore } from '@/store'

  const userApi = new User()
  const commonApi = new Common()
  const userStore = useUserStore()

  const formRef = $ref<FormInstance>()
  const mobileInfo = $ref<SetUserMobileViewMobileRequestModel>({})
  let loading = $ref(false)

  async function onGetCode() {
    const valid = await formRef.validateField('userMobile')
    if (!valid) return
    doLoadingCode()
    commonApi.sendSms({ type: 3, mobile: mobileInfo.userMobile! })
  }
  let codeTimer = $ref(-1)
  function doLoadingCode() {
    codeTimer = 30
    setInterval(() => (codeTimer -= 1), 1000, 30)
  }

  async function onSubmit() {
    const valid = await formRef.validate()
    if (!valid) return
    loading = true
    const res = await userApi.checkUserMobile(mobileInfo)
    if (res.data?.isUse) {
      userApi.setUserMobile(mobileInfo).then(res => {
        userStore.updateBind(false)
        loading = false
        if (res.data?.isLoginAgain) {
          userStore.clearUserInfo()
          window.location.href = window.location.origin
        }
      })
    } else {
      ElMessage.error(res.data?.message || '手机号不可用')
    }
  }
</script>
<style lang="scss" scoped>
  .code-button {
    width: 100px;
  }
</style>
