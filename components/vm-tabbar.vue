<template>
  <view class="vm-tabbar" :class="{ 'is-fixed': fixed }">
    <view
      v-for="item in TAB_LIST"
      :key="item.name"
      class="vm-tabbar__item"
      :class="{ 'is-active': inner === item.name }"
      @click="onSelect(item.name)"
    >
      <vm-ri-icon class="vm-tabbar__icon" :name="item.icon" />
      <text class="vm-tabbar__label">{{
        locale.t(`header.${item.name}`, item.text)
      }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { TAB_LIST, type TabName } from '../stores/app'
import { useLocaleStore } from '../stores/locale'
import VmRiIcon from './vm-ri-icon.vue'

type ShellTab = Exclude<TabName, 'tabbar'>

const props = withDefaults(
  defineProps<{
    modelValue?: ShellTab
    /** 固定底栏（壳外独立页用）；壳内嵌设 false */
    fixed?: boolean
  }>(),
  { modelValue: 'home', fixed: true },
)

const emit = defineEmits<{
  'update:modelValue': [name: ShellTab]
  change: [name: ShellTab]
}>()

const locale = useLocaleStore()
const inner = ref<ShellTab>(props.modelValue)

watch(
  () => props.modelValue,
  (v) => {
    if (v && v !== inner.value) inner.value = v
  },
)

function onSelect(name: ShellTab) {
  if (inner.value === name) return
  inner.value = name
  emit('update:modelValue', name)
  emit('change', name)
}
</script>

<style>
.vm-tabbar {
  flex-direction: row;
  align-items: stretch;
  min-height: 54px;
  padding-top: 6px;
  padding-bottom: 6px;
  background-color: var(--vm-card);
  border-top-width: 1px;
  border-top-style: solid;
  border-top-color: var(--vm-border);
}

.vm-tabbar.is-fixed {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
}

.vm-tabbar__item {
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 4px;
  padding-bottom: 6px;
}

.vm-tabbar__icon {
  font-size: 20px;
  line-height: 1;
  color: var(--vm-muted);
}

.vm-tabbar__label {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 500;
  line-height: 15px;
  color: var(--vm-muted);
}

.vm-tabbar__item.is-active .vm-tabbar__icon,
.vm-tabbar__item.is-active .vm-tabbar__label {
  color: var(--vm-primary);
  font-weight: 650;
}
</style>
