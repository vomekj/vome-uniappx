<template>
  <view v-if="show" class="tab-shell">
    <view class="tab-shell__body">
      <Home v-if="active === 'home'" />
      <Discover v-if="active === 'discover'" />
      <Message v-if="active === 'message'" />
      <Mine v-if="active === 'mine'" />
    </view>
    <vm-tabbar v-model="tabName" :fixed="false" @change="onTabChange" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Home from '../home/index.vue'
import Discover from '../discover/index.vue'
import Message from '../message/index.vue'
import Mine from '../mine/index.vue'
import VmTabbar from '../../components/vm-tabbar.vue'
import { TAB_LIST, useAppStore, type TabName } from '../../stores/app'
import { hideNativeTabBarIfNeeded } from '../../utils/navigation'

type ShellTab = Exclude<TabName, 'tabbar'>

const app = useAppStore()

function resolveTabName(name: string): ShellTab {
  const hit = TAB_LIST.find((item) => item.name === name)
  return hit ? hit.name : 'home'
}

function resolveTabUrl(name: ShellTab) {
  return TAB_LIST.find((item) => item.name === name)?.path ?? TAB_LIST[0].path
}

const tabName = ref<ShellTab>(
  resolveTabName(String(uni.getStorageSync('active') || 'home')),
)

const active = computed(() => tabName.value)
const show = computed(() => app.isMobile)

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

watch(
  () => app.isMobile,
  (isMobile) => {
    if (!isMobile) {
      app.debouncedSwitchTab(resolveTabUrl(tabName.value))
    }
  },
  { immediate: true },
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
