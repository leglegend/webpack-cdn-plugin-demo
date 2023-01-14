<template>
  <div class="clerk-code">
    <div class="top-bar">
      <div class="title">
        <icon-svg name="problem" color="#0075FF" size="24"></icon-svg>
        1.可创建每个员工的活码 2.顾客使用微信扫描不同员工的活码即可添加员工企业微信 3.
        添加成功后自动顾客自动进入会员列表，自动打标签，发送欢迎语
      </div>
      <el-button round @click="onCreate" :loading="loading && !currentId">
        <template #icon>
          <img
            src="@/assets/add.png"
            style="width: 20px; height: 20px; position: relative; top: -2px"
          />
        </template>
        添加活码
      </el-button>
    </div>
    <div class="content">
      <div class="item" v-for="item in codes" :key="item.id">
        <div class="title">
          <div>{{ item.createDate }}由{{ item.createName }}创建</div>
          <div>活码对应员工：{{ item.staffName }}</div>
        </div>
        <div class="card-box">
          <div class="card">
            <img class="card-img-left" src="@/assets/clerk_code_card_left.png" />
            <img class="card-img-bg" src="@/assets/clerk_code_card_bg.png" />
            <div class="card-title">坚果卡包企业微信</div>
            <div class="card-sub-title">扫码添加我的企业微信，为您订制更多的专属服务</div>
            <div class="card-content">
              <div class="content-top">
                <div class="code-box">
                  <img :src="item.codeUrl!" />
                </div>
              </div>
              <div class="content-middle">
                <div class="middle-left"></div>
                <div class="middle-dot" v-for="i in 76" :key="i"></div>
                <div class="middle-right"></div>
              </div>
              <div class="content-bottom">
                <div>长按识别二维码</div>
                <div>添加企业微信好友</div>
              </div>
            </div>
          </div>
        </div>

        <div class="buttons">
          <el-button
            size="large"
            @click="onEdit(item.id!)"
            :loading="loading && currentId === item.id"
          >
            编辑
          </el-button>
          <el-button type="primary" size="large" @click="onDownload(item)">下载</el-button>
        </div>
      </div>
    </div>
    <CreateCode v-model="showDialog" v-model:loading="loading" :id="currentId" @refresh="getList" />
    <div v-if="current" style="display: none">
      <canvas id="canvas" width="892" height="1185"></canvas>
      <img id="cardLeft" src="@/assets/clerk_code_card_left.png" crossorigin="anonymous" />
      <img id="cardBg" src="@/assets/clerk_code_card_bg.png" crossorigin="anonymous" />
      <img id="cardCode" :src="current?.codeUrl!" @load="onLoad" crossorigin="anonymous" />
    </div>
  </div>
</template>
<script setup lang="ts" name="ClerkCode">
  import CreateCode from './CreateCode.vue'
  import { WorkWeChatCode } from 'api/WorkWeChatCode'
  import type { WorkWechatStaffCodeResponseModel } from 'model'

  const workWeChatCodeApi = new WorkWeChatCode()

  let showDialog = $ref(false)
  const loading = $ref(false)
  let codes = $ref<WorkWechatStaffCodeResponseModel[]>([])
  function getList() {
    workWeChatCodeApi.getCodes({}).then(res => {
      if (res.data?.codes) codes = res.data.codes
    })
  }
  getList()
  let currentId = $ref<number | null>(null)
  let current = $ref<WorkWechatStaffCodeResponseModel | null>(null)
  function onCreate() {
    currentId = null
    showDialog = true
  }
  function onEdit(id: number) {
    currentId = id
    showDialog = true
  }
  function onDownload(code: WorkWechatStaffCodeResponseModel) {
    current = code
  }
  function onLoad() {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!

    const grd: CanvasGradient = ctx.createLinearGradient(0, 0, 300, 300)
    grd.addColorStop(0, '#DBE9FC')
    grd.addColorStop(0.33, '#EAE5F9')
    grd.addColorStop(0.66, '#ECF5FF')
    grd.addColorStop(1, '#DAE8FD')
    ctx.fillStyle = grd

    ctx.beginPath()
    ctx.moveTo(50, 0)
    ctx.arcTo(892, 0, 892, 1185, 50)
    ctx.arcTo(892, 1185, 0, 1185, 50)
    ctx.arcTo(0, 1185, 0, 0, 50)
    ctx.arcTo(0, 0, 892, 0, 50)
    ctx.fill()
    ctx.closePath()

    const cardLeftImg = document.getElementById('cardLeft') as HTMLImageElement
    ctx.drawImage(cardLeftImg, 35, 66, 123, 104)

    const cardBgImg = document.getElementById('cardBg') as HTMLImageElement
    ctx.drawImage(cardBgImg, 454, 59, 438, 497)

    ctx.fillStyle = '#000000'
    ctx.font = '62px Arial'
    ctx.fillText(current?.codeTitle || '坚果卡包企业微信', 49, 143)

    ctx.font = '31px Arial'
    ctx.fillText('扫码添加我的企业微信，为您订制更多的专属服务', 49, 209)

    ctx.beginPath()
    ctx.moveTo(68, 359)
    ctx.arcTo(852, 359, 852, 1145, 28)
    ctx.lineTo(852, 900)
    ctx.lineTo(40, 900)
    ctx.arcTo(40, 359, 852, 359, 28)
    ctx.fillStyle = '#ffffff'
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.moveTo(40, 900)
    ctx.lineTo(72, 900)
    ctx.lineTo(72, 956)
    ctx.lineTo(40, 956)
    ctx.arcTo(68, 956, 68, 928, 28)
    ctx.arcTo(68, 900, 40, 900, 28)
    ctx.fill()
    ctx.closePath()

    ctx.beginPath()
    ctx.moveTo(821, 900)
    ctx.lineTo(852, 900)
    ctx.arcTo(824, 900, 824, 928, 28)
    ctx.arcTo(824, 956, 852, 956, 28)
    ctx.lineTo(821, 956)
    ctx.lineTo(821, 900)
    ctx.fill()
    ctx.closePath()

    for (let i = 0; i < 25; i++) {
      const x = i * 30 + 72
      const y = 900
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 15, y)
      ctx.lineTo(x + 15, y + 26)
      ctx.arcTo(x + 13, y + 26, x + 13, y + 28, 2)
      ctx.arcTo(x + 13, y + 30, x + 15, y + 30, 2)
      ctx.lineTo(x + 15, y + 56)
      ctx.lineTo(x, y + 56)
      ctx.lineTo(x, y)
      ctx.fill()
      ctx.closePath()

      ctx.beginPath()
      ctx.moveTo(x + 15, y)
      ctx.lineTo(x + 30, y)
      ctx.lineTo(x + 30, y + 56)
      ctx.lineTo(x + 15, y + 56)
      ctx.lineTo(x + 15, y + 30)
      ctx.arcTo(x + 17, y + 30, x + 17, y + 28, 2)
      ctx.arcTo(x + 17, y + 26, x + 15, y + 26, 2)
      ctx.lineTo(x + 15, y)
      ctx.fill()
      ctx.closePath()
    }

    ctx.beginPath()
    ctx.moveTo(40, 956)
    ctx.lineTo(852, 956)
    ctx.arcTo(852, 1145, 40, 1145, 28)
    ctx.arcTo(40, 1145, 40, 359, 28)
    ctx.lineTo(40, 956)
    ctx.fill()
    ctx.closePath()

    ctx.textAlign = 'center'
    ctx.font = '36px Arial'
    ctx.fillStyle = '#909395'
    ctx.fillText('长按识别二维码', 446, 1000)

    ctx.fillStyle = '#000000'
    ctx.fillText('添加企业微信好友', 446, 1050)

    ctx.translate(234, 452)
    ctx.beginPath()
    ctx.moveTo(42, 0)
    ctx.arcTo(425, 0, 425, 425, 42)
    ctx.arcTo(425, 425, 0, 425, 42)
    ctx.arcTo(0, 425, 0, 0, 42)
    ctx.arcTo(0, 0, 425, 0, 42)
    ctx.strokeStyle = '#AEC9FA'
    ctx.lineWidth = 6
    ctx.stroke()

    const cardCodeImg = document.getElementById('cardCode') as HTMLImageElement
    ctx.drawImage(cardCodeImg, 20, 20, 385, 385)

    const el = document.createElement('a')
    el.href = canvas.toDataURL()
    el.download = `${current?.codeTitle}-${current?.staffName}的员工码`

    const event = new MouseEvent('click')
    el.dispatchEvent(event)

    current = null
  }
</script>
<style lang="scss" scoped>
  .clerk-code {
    min-height: var(--app-main-height);
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
        margin: 50px 0 20px 0;
        .icon-svg {
          margin-left: 6px;
        }
      }
    }
    .content {
      padding-top: 20px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      padding-bottom: 20px;
      .item {
        width: 393px;
        height: 422px;
        background: #ffffff;
        border-radius: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        .title {
          padding: 0 20px;
          color: #717f9d;
          font-size: 14px;
          line-height: 20px;
          box-sizing: border-box;
          width: 100%;
          height: 70px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .card-box {
          width: 194px;
          height: 257px;
          overflow: hidden;
          position: relative;
          margin-bottom: 35px;
          .card {
            transform: scale(0.217);
            transform-origin: left top;
            position: absolute;
            left: 0;
            top: 0;
          }
        }
        .card {
          width: 892px;
          height: 1185px;
          background: linear-gradient(-46deg, #dbe9fc, #eae5f9, #ecf5ff, #dae8fd);
          border-radius: 49px;
          box-sizing: border-box;
          padding: 40px;
          position: relative;
          .card-img-left {
            position: absolute;
            left: 35px;
            top: 66px;
            width: 123px;
            height: 104px;
          }
          .card-img-bg {
            position: absolute;
            right: 0;
            top: 59px;
            width: 438px;
            height: 497px;
          }
          .card-title {
            position: relative;
            padding-top: 70px;
            padding-bottom: 35px;
            font-size: 62px;
            line-height: 1;
            font-weight: bold;
            font-family: '宋体';
          }
          .card-sub-title {
            position: relative;
            font-size: 31px;
            line-height: 1;
            padding-bottom: 118px;
          }
          .card-content {
            position: relative;
            width: 812px;
            height: 790px;
            .content-top {
              background: #fffdfb;
              border-radius: 28px 28px 0 0;
              height: 520px;
              box-sizing: border-box;
              padding-top: 80px;
              display: flex;
              justify-content: center;
              .code-box {
                width: 425px;
                height: 425px;
                background: #fffdfb;
                border: 6px solid #aec9fa;
                border-radius: 42px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                img {
                  width: 370px;
                  height: 370px;
                }
              }
            }
            .content-middle {
              height: 52px;
              display: flex;
              .middle-left {
                width: 26px;
                height: 52px;
                background: radial-gradient(circle at left, transparent 26px, #ffffff 26px);
              }
              .middle-dot {
                height: 52px;
                width: 10px;
                background: radial-gradient(circle at center, transparent 2px, #ffffff 2px);
              }
              .middle-right {
                width: 26px;
                height: 52px;
                background: radial-gradient(circle at right, transparent 26px, #ffffff 26px);
              }
            }
            .content-bottom {
              height: 218px;
              border-radius: 0 0 28px 28px;
              background: #fffdfb;
              display: flex;
              flex-direction: column;
              align-items: center;
              font-size: 36px;
              line-height: 53px;
              div:nth-child(1) {
                padding-top: 20px;
                color: #909395;
              }
            }
          }
        }
        .buttons {
          .el-button {
            padding: 12px 45px;
          }
        }
      }
    }
  }
</style>
