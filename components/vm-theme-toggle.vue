<template>
  <view class="vm-theme-toggle" @click="onToggle">
    <vm-ri-icon :name="theme.isDark ? 'ri-sun-line' : 'ri-moon-line'" />
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '../stores/theme'
import VmRiIcon from './vm-ri-icon.vue'

const theme = useThemeStore()

function onToggle() {
  theme.toggleTheme()
}
</script>

<style>
.vm-theme-toggle {
  width: 36px;
  height: 36px;
  flex-direction: row;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-style: solid;
  border-color: var(--vm-border);
  border-radius: 8px;
  background-color: var(--vm-card);
}
</style>
