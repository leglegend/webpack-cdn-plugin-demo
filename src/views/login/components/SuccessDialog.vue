<template>
  <el-dialog v-model="showDialog" append-to-body width="680px">
    <div class="success-dialog">
      <img class="success-icon" src="@/assets/login_success_logo.png" />
      <div class="success-title">授权成功</div>
      <div class="success-sub-title">已与商家【坚果卡包旗舰店】完成数据互通</div>
      <div class="success-content">
        <div class="content-box">
          <img class="box-icon" src="@/assets/login_success_helper.png" />
          <div class="box-title">坚果卡包企微会员助手</div>
          <div class="box-phone">138229848720</div>
        </div>
        <img class="content-exchange" src="@/assets/login_success_exchange.png" />
        <div class="content-box">
          <img class="box-icon" src="@/assets/login_success_mini.png" />
          <div class="box-title">坚果卡包微信管理系统小程序</div>
          <div class="box-sub-title">坚果卡包会员旗舰店</div>
          <div class="box-phone">138229848720</div>
        </div>
      </div>
      <el-button size="large" round type="primary" @click="showDialog = false">开始使用</el-button>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
  import router from '@router'
  const props = defineProps<{
    modelValue: boolean
  }>()
  const emit = defineEmits<{
    (e: 'update:modelValue', showDialog: boolean): void
  }>()
  const showDialog = $computed({
    get: () => props.modelValue,
    set: () => router.push('/')
  })
</script>
<style lang="scss" scoped>
  .success-dialog {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    .success-icon {
      width: 48px;
      height: 48px;
    }
    .success-title {
      font-size: 18px;
      color: #152c5b;
      font-weight: bold;
      line-height: 25px;
    }
    .success-sub-title {
      font-size: 14px;
      color: #152c5b;
    }
    .success-content {
      display: flex;
      justify-content: space-between;
      padding: 20px 25px;
      width: 100%;
      box-sizing: border-box;
      align-items: center;
      .content-exchange {
        width: 33px;
        height: 30px;
      }
      .content-box {
        width: 237px;
        height: 151px;
        background: #ebf4ff;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .box-icon {
          width: 48px;
          height: 48px;
          position: relative;
          top: -24px;
        }
        .box-title {
          font-size: 14px;
          font-weight: bold;
          color: #152c5b;
          margin-bottom: 20px;
        }
        .box-sub-title {
          font-size: 14px;
          font-weight: bold;
          color: #0075ff;
        }
        .box-phone {
          font-size: 14px;
          font-weight: 400;
          color: #152c5b;
          margin-top: 10px;
        }
      }
    }
    .el-button {
      width: 405px;
    }
  }
</style>
