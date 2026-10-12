<template>
  <vm-page>
    <vm-header
      v-if="!app.isMobile"
      :title="t('header.home')"
      mode="nav"
    />
    <scroll-view class="scroll" scroll-y="true">
      <view class="card">
        <text class="card__title">{{ t('home.welcome') }}</text>
        <text class="card__desc">{{ t('home.hint') }}</text>
      </view>
    </scroll-view>
  </vm-page>
</template>

<script setup lang="ts">
import { useLocaleStore } from '../../stores/locale'
import { useAppStore } from '../../stores/app'
import { hideNativeTabBarIfNeeded } from '../../utils/navigation'
import { useMobileTabShell } from '../../utils/mobile-tab-shell'

const locale = useLocaleStore()
const app = useAppStore()
const t = (k: string) => locale.t(k)

useMobileTabShell('home')

onShow(() => {
  hideNativeTabBarIfNeeded()
})
</script>

<style>
.scroll {
  flex: 1;
}

.card {
  margin: 16px;
  padding: 16px;
  border-radius: 12px;
  background-color: var(--vm-card);
  flex-direction: column;
}

.card__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--vm-text);
  margin-bottom: 8px;
}

.card__desc {
  font-size: 14px;
  color: var(--vm-muted);
}
</style>
