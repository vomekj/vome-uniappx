<template>
  <!-- 宽屏导航顶栏（对齐经典 topWindow） -->
  <view v-if="mode === 'nav'" class="header header--nav" :class="themeClass">
    <view class="logo" @click="goHome">
      <text class="logo__title">{{ config.app.name }}</text>
    </view>

    <view class="nav">
      <view
        v-for="(item, index) in tabList"
        :key="item.name"
        class="nav-item"
        :class="{ 'is-active': current === index }"
        @click="switchTab(index)"
      >
        <vm-ri-icon class="nav-item__icon" :name="item.icon" />
        <text class="nav-item__text">{{
          locale.t(`header.${item.name}`, item.text)
        }}</text>
      </view>
    </view>

    <view class="actions">
      <vm-locale-toggle />
      <vm-theme-toggle />
      <view class="actions__user" @click="onUserClick">
        <view class="actions__avatar">
          <text class="actions__avatar-text">{{ avatarLetter }}</text>
        </view>
        <text class="actions__name">{{ displayName }}</text>
        <vm-ri-icon name="ri-arrow-down-s-line" class="actions__chevron" />
      </view>
    </view>
  </view>

  <!-- 页内顶栏（移动端 / 默认） -->
  <view v-else class="header header--page" :class="themeClass">
    <text class="header__title">{{ pageTitle }}</text>
    <view class="actions">
      <vm-locale-toggle />
      <vm-theme-toggle />
      <view class="actions__user" @click="onUserClick">
        <view class="actions__avatar">
          <text class="actions__avatar-text">{{ avatarLetter }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { config } from '../config'
import { TAB_LIST, useAppStore, type TabName } from '../stores/app'
import { useLocaleStore } from '../stores/locale'
import { useThemeStore } from '../stores/theme'
import { useUserStore } from '../stores/user'
import { openPage } from '../utils/navigation'
import VmLocaleToggle from './vm-locale-toggle.vue'
import VmThemeToggle from './vm-theme-toggle.vue'
import VmRiIcon from './vm-ri-icon.vue'

const props = withDefaults(
  defineProps<{
    title?: string
    /** page=页内顶栏；nav=宽屏导航（对齐经典） */
    mode?: 'page' | 'nav'
  }>(),
  { mode: 'page' },
)

const app = useAppStore()
const locale = useLocaleStore()
const theme = useThemeStore()
const user = useUserStore()
const tabList = TAB_LIST

const themeClass = computed(() => (theme.isDark ? 'is-dark' : ''))

const current = computed(() =>
  tabList.findIndex((item) => item.name === app.active),
)

const authed = computed(() => Boolean(user.token))

const displayName = computed(() =>
  authed.value
    ? user.displayName
    : locale.t('header.login', '登录'),
)

const avatarLetter = computed(() =>
  String(displayName.value || 'V').slice(0, 1).toUpperCase(),
)

const pageTitle = computed(
  () => props.title || locale.t('app.name') || config.app.name,
)

function goHome() {
  app.goHome()
}

function switchTab(index: number) {
  const item = tabList[index]
  if (!item) return
  app.goTabShell(item.name as Exclude<TabName, 'tabbar'>)
}

function onUserClick() {
  if (!authed.value) {
    openPage('/pages/login/index')
    return
  }
  app.goTabShell('mine')
}
</script>

<style>
.header {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  background-color: var(--vm-card);
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: var(--vm-border);
}

.header--page {
  padding: 12px 16px;
}

.header--nav {
  position: relative;
  height: 60px;
  padding-left: 28px;
  padding-right: 28px;
}

.header__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--vm-text);
}

.logo {
  z-index: 1;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  height: 60px;
}

.logo__title {
  font-size: 22px;
  font-weight: 800;
  color: var(--vm-text);
}

.nav {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  z-index: 1;
  flex-direction: row;
  align-items: center;
  transform: translateX(-50%);
}

.nav-item {
  flex-direction: row;
  align-items: center;
  height: 36px;
  padding-left: 14px;
  padding-right: 14px;
  margin-left: 3px;
  margin-right: 3px;
  border-radius: 10px;
}

.nav-item.is-active {
  background-color: var(--vm-soft-active);
}

.nav-item__icon {
  font-size: 16px;
  color: var(--vm-muted);
}

.nav-item.is-active .nav-item__icon {
  color: var(--vm-primary);
}

.nav-item__text {
  margin-left: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--vm-muted);
}

.nav-item.is-active .nav-item__text {
  color: var(--vm-primary);
  font-weight: 650;
}

.actions {
  z-index: 1;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
}

.actions__user {
  flex-direction: row;
  height: 36px;
  align-items: center;
  margin-left: 8px;
  padding-left: 4px;
  padding-right: 4px;
  border-radius: 18px;
}

.actions__avatar {
  width: 32px;
  height: 32px;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: var(--vm-soft-active);
}

.actions__avatar-text {
  font-size: 12px;
  font-weight: 700;
  color: var(--vm-primary);
}

.actions__name {
  max-width: 100px;
  margin-left: 8px;
  font-size: 13px;
  color: var(--vm-text);
}

.actions__chevron {
  margin-left: 4px;
  font-size: 14px;
  color: var(--vm-muted);
}
</style>
