<template>
  <view class="tab-shell">
    <vm-header v-if="app.useTopNav" mode="nav" />
    <view class="tab-shell__body">
      <Home v-if="active === 'home'" />
      <Discover v-if="active === 'discover'" />
      <Message v-if="active === 'message'" />
      <Mine v-if="active === 'mine'" />
    </view>
    <vm-tabbar
      v-if="app.useTabbarChrome"
      v-model="tabName"
      :fixed="false"
      @change="onTabChange"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Home from '../home/index.vue'
import Discover from '../discover/index.vue'
import Message from '../message/index.vue'
import Mine from '../mine/index.vue'
import VmTabbar from '../../components/vm-tabbar.vue'
import VmHeader from '../../components/vm-header.vue'
import { TAB_LIST, useAppStore, type TabName } from '../../stores/app'
import { hideNativeTabBarIfNeeded } from '../../utils/navigation'

/**
 * 唯一 Tab 路由壳：窄屏底栏 / 宽屏顶栏，同路由只换 chrome，禁止 resize switchTab。
 */
type ShellTab = Exclude<TabName, 'tabbar'>

const app = useAppStore()

function resolveTabName(name: string): ShellTab {
  const hit = TAB_LIST.find((item) => item.name === name)
  return hit ? hit.name : 'home'
}

const tabName = ref<ShellTab>(
  resolveTabName(String(uni.getStorageSync('active') || 'home')),
)

const active = computed(() => tabName.value)

function syncTabFromStorage() {
  const saved = resolveTabName(String(uni.getStorageSync('active') || 'home'))
  tabName.value = saved
  if (app.active !== saved) {
    app.setActive(saved)
  }
}

function onTabChange(name: ShellTab) {
  app.setActive(name)
}

onShow(() => {
  hideNativeTabBarIfNeeded()
  syncTabFromStorage()
})

watch(
  () => app.active,
  (name) => {
    if (!name || name === 'tabbar') return
    const next = resolveTabName(name)
    if (tabName.value !== next) tabName.value = next
  },
)
</script>

<style>
.tab-shell {
  flex: 1;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--vm-bg);
}

.tab-shell__body {
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
}
</style>
