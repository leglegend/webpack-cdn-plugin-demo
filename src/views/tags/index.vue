<template>
  <div>
    <div class="top-bar">
      <div class="title">
        手动群发消息给客户
        <icon-svg name="problem" color="#0075FF" size="24"></icon-svg>
      </div>
      <el-button round @click="onCreate">
        <template #icon>
          <icon-svg name="add" size="13" color="#409EFF"></icon-svg>
        </template>
        新建标签
      </el-button>
    </div>
    <div class="tag" v-for="(item, index) in tagStore.tagList" :key="index">
      <div class="title">
        {{ item.tagGroupName }}
        <el-button link type="primary" @click="onEdit(item)">编辑</el-button>
      </div>
      <div class="content flags" v-if="item.tagType == 1">
        <div class="flag" v-for="tag in item.tags" :key="tag.id">
          <icon-svg name="flag" size="27px" :color="(tag.tagIcon as string)"></icon-svg>
          <span v-if="tag.tagName">{{ tag.tagName }}</span>
          <span v-else class="none">无</span>
        </div>
      </div>
      <div class="content" v-else>
        <div class="item" v-for="tag in item.tags" :key="tag.id">{{ tag.tagName }}</div>
      </div>
    </div>
    <CreateTags v-model="showDialog" :tag="currentTag" @refresh="tagStore.getTagList(true)" />
  </div>
</template>

<script setup lang="ts" name="TagsManage">
  import CreateTags from './CreateTags.vue'
  import { useTagStore } from '@/store'
  import { StoreTagViewModel } from '@model'
  import { ElButton } from 'element-plus'

  const tagStore = useTagStore()

  tagStore.getTagList()

  let showDialog = $ref(false)
  let currentTag: StoreTagViewModel | undefined = $ref(undefined)

  function onCreate() {
    currentTag = undefined
    showDialog = true
  }
  function onEdit(tag: StoreTagViewModel) {
    currentTag = tag
    showDialog = true
  }
</script>

<style lang="scss" scoped>
  .div-class {
    background-color: red;
    :deep(.div2-class) {
      font-size: 15px;
      .div3-class {
        color: red;
      }
    }
  }
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
        margin-left: 6px;
      }
    }
  }
  .tag {
    background: #ffffff;
    border-radius: 15px;
    margin-bottom: 20px;
    .title {
      line-height: 50px;
      padding: 0 30px;
      border-bottom: 1px solid #eaeef7;
      display: flex;
      justify-content: space-between;
      color: #152c5b;
      font-weight: bold;
      font-size: 16px;
    }
    .content {
      padding: 20px 30px;
      display: flex;
      flex-wrap: wrap;
      gap: 20px 12px;
      .item {
        padding: 0 15px;
        border: 1px solid #eaeef7;
        color: #152c5b;
        font-size: 14px;
        border-radius: 5px;
        line-height: 29px;
      }
      .flag {
        font-size: 14px;
        display: flex;
        gap: 0 7px;
        font-size: 14px;
        color: #152c5b;
        align-items: center;
        .none {
          color: #152c5b50;
        }
      }
    }

    .flags {
      gap: 0 40px;
    }
  }
</style>
