<template>
  <scroll-view class="sidebar" scroll-y="true">
    <view class="project-block">
      <text class="project-block__label">{{
        locale.t('aside.currentApp', '当前应用')
      }}</text>
      <text class="project-block__name">{{ config.app.name }}</text>
    </view>

    <view class="menu">
      <view
        v-for="item in menus"
        :key="item.name"
        class="menu-item"
        :class="{ 'is-active': app.active === item.name }"
        @click="goTab(item)"
      >
        <text class="menu-item__text">{{
          locale.t(`header.${item.name}`, item.title)
        }}</text>
      </view>
    </view>
  </scroll-view>
</template>

<script setup lang="ts">
import { config } from '../config'
import { useAppStore, type TabName } from '../stores/app'
import { useLocaleStore } from '../stores/locale'
import { openPage } from '../utils/navigation'

const app = useAppStore()
const locale = useLocaleStore()

const menus: Array<{ name: TabName; title: string; path: string }> = [
  { name: 'home', title: '首页', path: '/pages/home/index' },
  { name: 'discover', title: '发现', path: '/pages/discover/index' },
  { name: 'message', title: '消息', path: '/pages/message/index' },
  { name: 'mine', title: '我的', path: '/pages/mine/index' },
]

function goTab(item: (typeof menus)[number]) {
  app.setActive(item.name)
  openPage(item.path)
}
</script>

<style>
.sidebar {
  position: fixed;
  width: 240px;
  top: 60px;
  bottom: 0;
  left: 0;
  background-color: var(--vm-bg);
  border-right-width: 1px;
  border-right-style: solid;
  border-right-color: var(--vm-border);
}

.project-block {
  padding: 20px 18px 16px;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--vm-border);
  flex-direction: column;
}

.project-block__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--vm-muted);
}

.project-block__name {
  font-size: 15px;
  font-weight: 700;
  color: var(--vm-primary);
}

.menu {
  padding-top: 8px;
  padding-bottom: 8px;
  flex-direction: column;
}

.menu-item {
  flex-direction: row;
  align-items: center;
  margin-left: 10px;
  margin-right: 10px;
  margin-top: 2px;
  margin-bottom: 2px;
  padding: 12px 14px;
  border-radius: 10px;
}

.menu-item.is-active {
  background-color: var(--vm-soft-active);
}

.menu-item__text {
  font-size: 14px;
  font-weight: 500;
  color: var(--vm-text);
}

.menu-item.is-active .menu-item__text {
  color: var(--vm-primary);
  font-weight: 650;
}
</style>
