<template>
  <vm-page>
    <vm-header :title="t('login.title')" />
    <view class="form">
      <text class="form__label">{{ t('login.username') }}</text>
      <input
        class="form__input"
        :value="account"
        @input="onAccount"
        placeholder="手机号或邮箱"
      />
      <text class="form__label">{{ t('login.password') }}</text>
      <input
        class="form__input"
        :value="password"
        password="true"
        @input="onPass"
        placeholder="password"
      />
      <view
        class="form__submit"
        :class="{ 'form__submit--disabled': submitting }"
        @click="onSubmit"
      >
        <text class="form__submit-text">{{
          submitting ? t('common.loading') : t('login.submit')
        }}</text>
      </view>
    </view>
  </vm-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLocaleStore } from '../../stores/locale'
import { useUserStore } from '../../stores/user'
import { useAppStore } from '../../stores/app'

const locale = useLocaleStore()
const user = useUserStore()
const t = (k: string) => locale.t(k)

const account = ref('')
const password = ref('')
const submitting = ref(false)

function onAccount(e: { detail?: { value?: string } }) {
  account.value = String(e?.detail?.value || '')
}

function onPass(e: { detail?: { value?: string } }) {
  password.value = String(e?.detail?.value || '')
}

async function onSubmit() {
  if (submitting.value) return
  if (!account.value || !password.value) {
    uni.showToast({ title: '请填写账号密码', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await user.loginByPassword({
      account: account.value.trim(),
      password: password.value,
    })
    uni.showToast({ title: '登录成功', icon: 'none' })
    useAppStore().goTabShell('mine')
  } catch (e) {
    const msg = e instanceof Error ? e.message : '登录失败'
    uni.showToast({ title: msg.slice(0, 40), icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style>
.form {
  flex: 1;
  flex-direction: column;
  padding: 24px 16px;
}

.form__label {
  font-size: 13px;
  color: var(--vm-muted);
  margin-bottom: 6px;
  margin-top: 12px;
}

.form__input {
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  background-color: var(--vm-card);
  border-width: 1px;
  border-style: solid;
  border-color: var(--vm-border);
  font-size: 15px;
  color: var(--vm-text);
}

.form__submit {
  margin-top: 24px;
  height: 44px;
  border-radius: 10px;
  background-color: var(--vm-primary);
  align-items: center;
  justify-content: center;
}

.form__submit--disabled {
  opacity: 0.55;
}

.form__submit-text {
  font-size: 15px;
  color: #ffffff;
}
</style>
