<template>
  <view class="vm-locale-toggle">
    <view
      id="vm-locale-toggle-btn"
      class="vm-locale-toggle__btn"
      :class="{ 'is-disabled': switching }"
      @click.stop="toggleMenu"
    >
      <image
        v-if="locale.currentLang?.flag"
        class="vm-locale-toggle__flag"
        :src="String(locale.currentLang.flag)"
        mode="aspectFill"
      />
      <text v-else class="vm-locale-toggle__code">{{ shortCode }}</text>
    </view>
    <view v-if="open" class="vm-locale-toggle__mask" @click="closeMenu" />
    <view
      v-if="open"
      class="vm-locale-toggle__menu"
      :style="menuStyle"
      @click.stop
    >
      <view
        v-for="lang in locale.langs"
        :key="lang.code"
        class="vm-locale-toggle__item"
        :class="{ 'is-active': locale.locale === lang.code }"
        @click="switchLocale(lang.code)"
      >
        <image
          v-if="lang.flag"
          class="vm-locale-toggle__flag"
          :src="String(lang.flag)"
          mode="aspectFill"
        />
        <text class="vm-locale-toggle__label">{{ lang.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useLocaleStore } from '../stores/locale'

const locale = useLocaleStore()
const open = ref(false)
const switching = ref(false)
const menuStyle = ref<Record<string, string>>({})

const shortCode = computed(() =>
  String(locale.locale || 'zh').slice(0, 2).toUpperCase(),
)

function closeMenu() {
  open.value = false
}

function placeMenu() {
  const winW = (() => {
    try {
      return Number(uni.getSystemInfoSync().windowWidth || 375)
    } catch {
      return 375
    }
  })()

  uni
    .createSelectorQuery()
    .select('#vm-locale-toggle-btn')
    .boundingClientRect((rect) => {
      const r = rect as { right?: number; bottom?: number } | null
      if (!r || r.right == null || r.bottom == null) return
      const gap = 6
      menuStyle.value = {
        top: `${Number(r.bottom) + gap}px`,
        right: `${Math.max(8, winW - Number(r.right))}px`,
      }
    })
    .exec()
}

function toggleMenu() {
  if (switching.value) return
  if (open.value) {
    closeMenu()
    return
  }
  placeMenu()
  open.value = true
}

async function switchLocale(code: string) {
  if (switching.value) return
  switching.value = true
  closeMenu()
  try {
    await locale.setLocale(code)
  } finally {
    switching.value = false
  }
}

onMounted(() => {
  if (!locale.langs.length) void locale.loadLangs()
})
</script>

<style>
.vm-locale-toggle {
  position: relative;
  z-index: 30;
  flex-direction: row;
  flex-shrink: 0;
}

.vm-locale-toggle__btn {
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

.vm-locale-toggle__btn.is-disabled {
  opacity: 0.6;
}

.vm-locale-toggle__flag {
  width: 20px;
  height: 20px;
  border-radius: 10px;
}

.vm-locale-toggle__code {
  font-size: 11px;
  font-weight: 600;
  color: var(--vm-text);
}

.vm-locale-toggle__mask {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.vm-locale-toggle__menu {
  position: fixed;
  z-index: 1001;
  min-width: 120px;
  max-width: 160px;
  padding: 4px;
  border-radius: 10px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--vm-border);
  background-color: var(--vm-card);
  flex-direction: column;
}

.vm-locale-toggle__item {
  flex-direction: row;
  align-items: center;
  padding: 8px 10px;
  border-radius: 8px;
}

.vm-locale-toggle__item.is-active {
  background-color: var(--vm-soft-active);
}

.vm-locale-toggle__label {
  flex: 1;
  margin-left: 8px;
  font-size: 12px;
  color: var(--vm-text);
}
</style>
