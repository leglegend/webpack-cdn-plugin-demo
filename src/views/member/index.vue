<template>
  <div class="member-home">
    <div class="top-bar">
      <div class="member-tabs">
        <el-tabs v-model="dataType" @tab-change="onTabChange">
          <el-tab-pane
            :label="`已加企微信好友(${report.contactUserSum || 0})`"
            :name="1"
          ></el-tab-pane>
          <el-tab-pane
            :label="`未加企微信好友(${report.noContactUserSum || 0})`"
            :name="2"
          ></el-tab-pane>
          <el-tab-pane :label="`全部(${report.allUserSum || 0})`" :name="0"></el-tab-pane>
        </el-tabs>
      </div>
      <div class="option-battons">
        <el-space :size="10">
          <el-button round @click="showCreateDialog = true" :loading="createLoading">
            <template #icon>
              <img
                src="@/assets/add.png"
                style="width: 20px; height: 20px; position: relative; top: -2px"
              />
            </template>
            新增会员
          </el-button>
          <el-button round @click="onSetTags" :loading="tagsLoading">
            <template #icon>
              <img
                src="@/assets/print.png"
                style="width: 20px; height: 20px; position: relative; top: -2px"
              />
            </template>
            批量打标签
          </el-button>
          <el-button round @click="showImportUserDialog = true">
            <template #icon>
              <img
                src="@/assets/setting.png"
                style="width: 20px; height: 20px; position: relative; top: 0px"
              />
            </template>
            导入外部联系人
          </el-button>
        </el-space>
      </div>
    </div>
    <div class="member-list">
      <div class="search-box">
        <div class="search-input">
          <el-input v-model="keyword" @keyup.enter.native="onSearch()" placeholder="会员名/手机号">
            <template #suffix>
              <icon-svg
                class="select"
                name="search"
                size="23px"
                color="#78797D"
                @click="onSearch()"
              ></icon-svg>
            </template>
          </el-input>
          <div class="search-button" @click="showSearchDialog = true">
            高级搜索
            <icon-svg name="down" color="#000000" size="15px"></icon-svg>
          </div>
        </div>
        <div class="search-buttons">
          <el-scrollbar>
            <div class="tag-list">
              <el-button
                v-for="item in conditionStore.conditionList"
                :key="item.id"
                @click="onQuickSearch(item.id as number)"
                round
                size="small"
                :type="item.id === currentId ? 'primary' : ''"
              >
                {{ item.conditionTitle }}
              </el-button>
            </div>
          </el-scrollbar>

          <img
            @click="showQuickDialog = true"
            style="width: 38px; height: 38px; cursor: pointer; flex: none"
            src="@/assets/btn.png"
          />
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        :style="{ width: '100%' }"
        :row-style="{ height: '67px', 'font-size': '16px' }"
        :header-row-style="{ height: '58px', 'font-size': '16px' }"
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="60" align="center" />
        <el-table-column prop="userName" label="会员" width="180" align="center">
          <template #default="{ row }">{{ row.remarkName || row.userName }}</template>
        </el-table-column>
        <el-table-column prop="totalMoney" label="会员卡余额" width="180" align="center">
          <template #default="{ row }">
            <template v-if="row.totalMoney && row.totalTimes">
              {{ row.totalMoney + '/' + row.totalTimes }}
            </template>
            <template v-else-if="row.totalMoney || row.totalTimes">
              {{ row.totalMoney || row.totalTimes }}
            </template>
            <template v-else>-</template>
          </template>
        </el-table-column>
        <el-table-column prop="staffName" label="归属人" width="180" align="center">
          <template #default="{ row }">
            {{ row.staffName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="关联企微好友" width="180" align="center">
          <template #default="{ row }">
            {{ row.workWeChatInfo?.weChatName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="企微添加来源" width="180" align="center">
          <template #default="{ row }">
            {{ row.workWeChatInfo?.workWeChatAddWay || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="option" label="操作" min-width="150" align="center">
          <template #default="{ row }">
            <el-space :size="10">
              <div class="list-option" v-if="row.workWeChatInfo?.externalUserId">
                <icon-svg name="weixin" size="30px" @click="onSendMessage(row)"></icon-svg>
                <div class="option-title">发消息</div>
              </div>
              <div class="list-option" @click="onViewMember(row)">
                <icon-svg name="view" size="30" color="#767981"></icon-svg>
                <div class="option-title">查看</div>
              </div>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="bottom-bar">
      <div class="bar-text">共{{ total }}条结果，当前选中{{ selectedCount }}行</div>
      <el-pagination
        background
        v-model:currentPage="currentPage"
        layout="prev, pager, next"
        :total="total"
      />
    </div>

    <QuickSearch v-model="showQuickDialog" :conditions="conditionStore.conditionList" />
    <MemberSearch v-model="showSearchDialog" :condition="curForm" @search="onSearch" />
    <MemberDetail
      v-model="showDetailDialog"
      v-model:loading="loading"
      :current="currentMember"
      @refresh="onRefresh()"
    />
    <CreateMember
      v-model="showCreateDialog"
      v-model:loading="createLoading"
      @refresh="onRefresh()"
    />
    <SetTags v-model="showSetTagsDialog" v-model:loading="tagsLoading" :cardIds="selectedUsers" />
    <ImportUser v-model="showImportUserDialog" />
  </div>
</template>
<script setup lang="ts" name="Home">
  import MemberSearch from '@/components/MemberSearch.vue'
  import QuickSearch from './components/QuickSearch.vue'
  import MemberDetail from './components/MemberDetail.vue'
  import CreateMember from './components/CreateMember.vue'
  import SetTags from './components/SetTags.vue'
  import ImportUser from './components/ImportUser.vue'
  import pageHook from '@/utils/hooks/page'
  import { User } from '@api/User'
  import { WorkWeChat } from '@api/WorkWeChat'
  import {
    UserSearchConditionViewModel,
    GetUserListResponseModel,
    GetUserInfoResponseModel,
    GetUserSumResponseModel
  } from 'model'
  import { useConditionStore } from '@/store'

  const userApi = new User()

  // #region 快速搜索管理
  const conditionStore = useConditionStore()
  conditionStore.getConditionList()
  const showQuickDialog = $ref(false)
  let currentId = $ref(-1)
  function onQuickSearch(id: number) {
    currentId = id
    loading = true
    userApi
      .getUserSearchConditionInfo({ id })
      .then(res => {
        keyword = res.data?.conditionInfo?.keyWord || ''
        onSearch(res.data?.conditionInfo)
      })
      .catch(() => (loading = false))
  }
  // #endregion

  // #region 高级搜索
  const showSearchDialog = $ref(false)
  let keyword = $ref('')
  let loading = $ref(false)
  let tableData = $ref<GetUserListResponseModel[]>([])
  const dataType = $ref(0)
  const { currentPage, total, addCurrentChangeEvent } = pageHook(true)
  let curForm = $ref<UserSearchConditionViewModel>({})

  function onTabChange() {
    keyword = ''
    onSearch()
  }

  function onSearch(form?: UserSearchConditionViewModel) {
    if (form) curForm = form
    loading = true
    curForm.keyWord = keyword
    userApi
      .getUsersList({
        pageSize: 10,
        pageIndex: currentPage.value,
        searchCondition: curForm,
        dataType
      })
      .then(res => {
        if (res.data) tableData = res.data
        total.value = res.totalCount || 0
      })
      .finally(() => (loading = false))
  }
  addCurrentChangeEvent(onSearch)
  // #endregion

  // #region 会员数量
  let report = $ref<GetUserSumResponseModel>()
  function getUsersSum() {
    userApi.getUsersSum({}).then(res => {
      if (res.data) report = res.data
    })
  }
  getUsersSum()
  function onRefresh() {
    getUsersSum()
    onSearch()
  }
  // #endregion

  // #region 选中相关操作
  let selectedCount = $ref(0)
  let selectedUsers: number[] = $ref([])
  function onSelectionChange(list: GetUserListResponseModel[]) {
    selectedCount = list.length
    selectedUsers = list.map(item => item.cardId!)
  }

  let showSetTagsDialog = $ref(false)
  const tagsLoading = $ref(false)
  function onSetTags() {
    if (!selectedCount) return ElMessage.warning('请先选择会员')
    showSetTagsDialog = true
  }
  // #endregion

  // #region 导入会员
  const showImportUserDialog = $ref(false)
  // #endregion

  // #region 查看会员
  let showDetailDialog = $ref(false)
  let currentMember = $ref<GetUserInfoResponseModel>()
  function onViewMember(member: GetUserListResponseModel) {
    showDetailDialog = true
    currentMember = {
      userId: member.userId!,
      cardId: member.cardId
    }
  }
  // #endregion

  // #region 新建
  const showCreateDialog = $ref(false)
  const createLoading = $ref(false)
  // #endregion

  // #region 企业微信相关

  // 注册应用信息
  const workWeChatApi = new WorkWeChat()
  workWeChatApi
    .getJsSignature({
      url: window.location.href
    })
    .then(res => {
      wx.agentConfig({
        corpid: res.data?.appId, // 必填，企业微信的corpID
        agentid: res.data?.agentId,
        timestamp: res.data?.timesTamp, // 必填，生成签名的时间戳
        nonceStr: res.data?.nonce, // 必填，生成签名的随机串
        signature: res.data?.signature, // 必填，签名，见 附录-JS-SDK使用权限签名算法
        jsApiList: ['openEnterpriseChat'], // 必填，需要使用的JS接口列表，凡是要调用的接口都需要传进来
        fail: function (res: any) {
          alert(JSON.stringify(res))
          console.log(res)
        }
      })
    })

  function onSendMessage(member: GetUserListResponseModel) {
    if (member.workWeChatInfo?.externalUserId) {
      wx.openEnterpriseChat({
        externalUserIds: member.workWeChatInfo?.externalUserId,
        groupName: '',
        chatId: '',
        userIds: '',
        fail: function (res: any) {
          alert(JSON.stringify(res))
          console.log(res)
        }
      })
    }
  }
  // #endregion
</script>
<style lang="scss" scoped>
  .member-home {
    min-height: var(--app-main-height);
    --top-bar-height: 75px;
    --bottom-bar-height: 85px;
    .top-bar {
      height: var(--top-bar-height);
      box-sizing: border-box;
      display: flex;
      align-items: flex-end;
      .member-tabs {
        padding-left: 25px;
        .el-tabs {
          --el-font-size-base: 16px;
        }
      }
      .option-battons {
        flex: 1;
        padding-bottom: 18px;
        display: flex;
        justify-content: flex-end;
      }
    }
    .member-list {
      min-height: calc(
        100vh - var(--app-top-height) - var(--top-bar-height) - var(--bottom-bar-height)
      );
      border-radius: 20px;
      background: #ffffff;
      overflow: hidden;

      .search-box {
        padding: 0 25px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .search-input {
          width: 420px;
          display: flex;
          align-items: center;
          flex: none;
          .search-button {
            width: 100px;
            padding-left: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            flex: none;
            gap: 5px;
          }
        }
        .search-buttons {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          overflow: hidden;
          .el-scrollbar {
            width: calc(100% - 38px);
            height: 80px;
          }
          .tag-list {
            display: flex;
            align-items: center;
            height: 80px;
          }
        }
        .select {
          cursor: pointer;
        }
      }

      .el-table {
        --el-table-header-text-color: #152c5b;
        --el-table-header-bg-color: #f8fbfd;
      }

      .list-option {
        text-align: center;
        width: 45px;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        .option-title {
          line-height: 1;
          font-size: 14px;
        }
      }
    }
    .bottom-bar {
      height: var(--bottom-bar-height);
      padding-bottom: 25px;
      box-sizing: border-box;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      .bar-text {
        padding-left: 15px;
        font-size: 14px;
        color: #717f9d;
      }
    }
  }
</style>
