<template>
  <view class="vm-page" :class="themeClass">
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '../stores/theme'

const theme = useThemeStore()
const themeClass = computed(() =>
  theme.isDark ? 'theme-dark' : 'theme-light',
)
</script>

<style>
.vm-page {
  flex: 1;
  flex-direction: column;
  background-color: var(--vm-bg);
}
</style>
