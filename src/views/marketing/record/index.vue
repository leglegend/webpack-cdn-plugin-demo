<template>
  <div class="message-record">
    <div class="record-search">
      <div class="search-item">
        <span>类型</span>
        <el-select v-model="form.msgType" placeholder="类型不限" @change="getList">
          <el-option :value="null" :label="'类型不限'"></el-option>
          <el-option :value="0" :label="'自动群发'"></el-option>
          <el-option :value="1" :label="'手动群发'"></el-option>
        </el-select>
      </div>
      <div class="search-item">
        <span>自定义</span>
        <span class="item-deta">
          <el-date-picker
            v-model="form.sendDateStart"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="开始时间"
            @change="getList"
          />
          至
          <el-date-picker
            v-model="form.sendDateEnd"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            type="date"
            placeholder="结束时间"
            @change="getList"
          />
        </span>
      </div>
    </div>
    <div class="record-list">
      <el-table
        :loading="loading"
        :data="messages"
        :style="{ width: '100%' }"
        :row-style="{ height: '67px', 'font-size': '16px' }"
        :header-row-style="{ height: '58px', 'font-size': '16px' }"
      >
        <el-table-column prop="msgInfo" label="消息内容" min-width="500" align="center" />
        <el-table-column prop="searchConditionTitle" label="群发类型" width="250" align="center">
          <template #default="{ row }">
            {{ row.msgType == 1 ? '手动群发' : '自动群发' }}
          </template>
        </el-table-column>
        <el-table-column prop="sendTime" label="发送时间" width="250" align="center" />
        <el-table-column
          prop="sendPeopleSum"
          label="发送情况"
          width="250"
          align="center"
        ></el-table-column>
      </el-table>
    </div>
    <footer class="pagination">
      <el-pagination
        background
        v-model:currentPage="currentPage"
        layout="prev, pager, next"
        :total="total"
      />
    </footer>
  </div>
</template>
<script lang="ts" setup>
  import { Message } from 'api/Message'
  import {
    GetWorkWeChatMsgsSendLogRequestModel,
    GetWorkWeChatMsgsSendLogResponseModel
  } from 'model'
  import pageHook from '@/utils/hooks/page'
  const tableLoading = $ref(false)

  const messageApi = new Message()
  let messages: GetWorkWeChatMsgsSendLogResponseModel[] = []
  const form = $ref<GetWorkWeChatMsgsSendLogRequestModel>({})
  const { currentPage, pageSize, total, addCurrentChangeEvent } = pageHook(true)
  let loading = $ref(false)
  function getList() {
    loading = true
    form.pageIndex = currentPage.value
    form.pageSize = pageSize.value
    messageApi
      .getWorkWeChatMsgsSendLog(form)
      .then(res => {
        if (res.data) messages = res.data
        total.value = res.totalCount || 0
      })
      .finally(() => (loading = false))
  }
  addCurrentChangeEvent(getList)
</script>
<style lang="scss" scoped>
  .message-record {
    padding: 20px 0;
    .record-search {
      display: flex;
      align-items: center;
      gap: 40px;
      margin-bottom: 20px;
      .search-item {
        display: flex;
        align-items: center;
        gap: 20px;
        span {
          color: #152c5b;
          font-weight: bold;
          font-size: 16px;
        }
        .item-deta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 400;
        }
      }
    }
    .record-list {
      background: #ffffff;
      border-radius: 30px;
      overflow: hidden;
      .el-table {
        --el-table-header-text-color: #152c5b;
        --el-table-header-bg-color: #f8fbfd;
      }
    }
    .pagination {
      padding: 20px 0;
      display: flex;
      justify-content: center;
    }
  }
</style>
