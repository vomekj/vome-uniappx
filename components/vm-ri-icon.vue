<template>
  <text class="vm-ri-icon" aria-hidden="true">{{ glyph }}</text>
</template>

<script setup lang="ts">
/**
 * Remix Icon（本地 ttf + font-family）。
 * name 必须是完整 remix 名，如 `ri-home-5-line`。
 */
import { computed } from 'vue'
import { REMIX_GLYPHS } from '../utils/remixicon-glyphs'

const props = defineProps<{
  name: string
}>()

const glyph = computed(() => {
  const key = String(props.name || '').trim()
  return key ? REMIX_GLYPHS[key] || '' : ''
})
</script>

<style>
.vm-ri-icon {
  font-family: remixicon;
  font-style: normal;
  font-size: 18px;
  line-height: 1;
  color: var(--vm-muted);
}
</style>
