<template>
  <vm-page>
    <vm-header
      v-if="!app.isMobile"
      :title="t('header.mine')"
      mode="nav"
    />
    <view class="body">
      <text class="body__name">{{ displayName }}</text>
      <view v-if="!token" class="body__btn" @click="goLogin">
        <text class="body__btn-text">{{ t('login.title') }}</text>
      </view>
      <view v-else class="body__btn body__btn--ghost" @click="onLogout">
        <text class="body__btn-text body__btn-text--ghost">{{
          t('header.logout')
        }}</text>
      </view>
    </view>
  </vm-page>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useLocaleStore } from '../../stores/locale'
import { useUserStore } from '../../stores/user'
import { useAppStore } from '../../stores/app'
import { hideNativeTabBarIfNeeded, openPage } from '../../utils/navigation'
import { useMobileTabShell } from '../../utils/mobile-tab-shell'

const locale = useLocaleStore()
const user = useUserStore()
const app = useAppStore()
const { token, displayName } = storeToRefs(user)
const t = (k: string) => locale.t(k)

useMobileTabShell('mine')

onShow(() => {
  hideNativeTabBarIfNeeded()
})

function goLogin() {
  openPage('/pages/login/index')
}

function onLogout() {
  user.logout()
}
</script>

<style>
.body {
  flex: 1;
  flex-direction: column;
  padding: 24px 16px;
}

.body__name {
  font-size: 18px;
  font-weight: 600;
  color: var(--vm-text);
  margin-bottom: 16px;
}

.body__btn {
  align-self: flex-start;
  padding: 10px 16px;
  border-radius: 10px;
  background-color: var(--vm-primary);
}

.body__btn--ghost {
  background-color: var(--vm-bg);
  border-width: 1px;
  border-style: solid;
  border-color: var(--vm-border);
}

.body__btn-text {
  font-size: 14px;
  color: #ffffff;
}

.body__btn-text--ghost {
  color: var(--vm-text);
}
</style>
