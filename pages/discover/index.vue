<template>
  <vm-page>
    <view class="body">
      <text class="body__text">{{ t('common.empty') }}</text>
    </view>
  </vm-page>
</template>

<script setup lang="ts">
import { useLocaleStore } from '../../stores/locale'
import { hideNativeTabBarIfNeeded } from '../../utils/navigation'
import { useMobileTabShell } from '../../utils/mobile-tab-shell'

const locale = useLocaleStore()
const t = (k: string) => locale.t(k)

useMobileTabShell('discover')

onShow(() => {
  hideNativeTabBarIfNeeded()
})
</script>

<style>
.body {
  flex: 1;
  padding: 24px 16px;
}

.body__text {
  font-size: 14px;
  color: var(--vm-muted);
}
</style>
