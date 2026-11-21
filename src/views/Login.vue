<template>
  <div class="apple-login">
    <div class="top">
      <button class="back" @click="goBack">‹ 返回</button>
    </div>

    <div class="shell">
      <div class="brand-mark">🍏</div>
      <h1 class="title">田园鲜果</h1>
      <p class="subtitle">登录后可收藏、留言与申请商家。</p>

      <div class="segmented">
        <button
          v-for="m in modes"
          :key="m.value"
          class="seg-btn"
          :class="{ on: mode === m.value }"
          @click="mode = m.value"
        >
          {{ m.label }}
        </button>
      </div>

      <!-- 登录 -->
      <form v-if="mode === 'login'" class="form" @submit.prevent>
        <label class="field">
          <span class="field-label">账号</span>
          <input v-model="loginForm.account" class="input" placeholder="手机号或账号" />
        </label>
        <label class="field">
          <span class="field-label">密码</span>
          <input
            v-model="loginForm.password"
            class="input"
            type="password"
            placeholder="请输入密码"
          />
        </label>
        <button type="button" class="primary" :disabled="submitting" @click="onLogin">
          {{ submitting ? '登录中…' : '登录' }}
        </button>
        <p class="link-note">
          还没有账号？<a @click="mode = 'register'">注册 ›</a>
        </p>
      </form>

      <!-- 注册 -->
      <form v-else class="form" @submit.prevent>
        <label class="field">
          <span class="field-label">手机号</span>
          <input
            v-model="regForm.phone"
            class="input"
            type="tel"
            maxlength="11"
            placeholder="请输入手机号"
          />
        </label>
        <label class="field">
          <span class="field-label">密码</span>
          <input
            v-model="regForm.password"
            class="input"
            type="password"
            placeholder="设置登录密码"
          />
        </label>
        <label class="field">
          <span class="field-label">确认密码</span>
          <input
            v-model="regForm.confirm"
            class="input"
            type="password"
            placeholder="再次输入密码"
          />
        </label>
        <button type="button" class="primary" :disabled="submitting" @click="onRegister">
          {{ submitting ? '提交中…' : '注册并登录' }}
        </button>
        <p class="link-note">
          已有账号？<a @click="mode = 'login'">去登录 ›</a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showSuccessToast } from 'vant'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const modes = [
  { value: 'login', label: '登录' },
  { value: 'register', label: '注册' }
]
const mode = ref('login')
const submitting = ref(false)

const loginForm = reactive({ account: '', password: '' })
const regForm = reactive({ phone: '', password: '', confirm: '' })

function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone)
}

async function onLogin() {
  if (!loginForm.account) {
    showToast('请输入账号')
    return
  }
  if (!loginForm.password) {
    showToast('请输入密码')
    return
  }
  submitting.value = true
  try {
    await auth.loginByPassword({ account: loginForm.account, password: loginForm.password })
    afterLogin()
  } catch (e) {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

async function onRegister() {
  if (!isValidPhone(regForm.phone)) {
    showToast('请输入正确的手机号')
    return
  }
  if (!regForm.password) {
    showToast('请设置密码')
    return
  }
  if (regForm.password !== regForm.confirm) {
    showToast('两次输入的密码不一致')
    return
  }
  submitting.value = true
  try {
    await auth.register({ phone: regForm.phone, password: regForm.password })
    showSuccessToast('注册成功')
    afterLogin()
  } catch (e) {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

function afterLogin() {
  const redirect = route.query.redirect
  const target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/mine'
  router.replace(target)
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.apple-login {
  min-height: 100vh;
  background: #ffffff;
  padding: 20px 20px 48px;
  color: #1d1d1f;
  font-family: -apple-system, 'SF Pro Text', 'PingFang SC', 'Helvetica Neue', 'Microsoft YaHei',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
.top {
  max-width: 400px;
  margin: 0 auto 28px;
}
.back {
  border: 0;
  background: transparent;
  color: #0071e3;
  font-size: 17px;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}
.shell {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
.brand-mark {
  font-size: 44px;
  line-height: 1;
}
.title {
  margin: 14px 0 6px;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}
.subtitle {
  margin: 0 0 32px;
  font-size: 15px;
  color: #6e6e73;
}

.segmented {
  display: flex;
  background: #f5f5f7;
  border-radius: 10px;
  padding: 3px;
  margin-bottom: 28px;
}
.seg-btn {
  flex: 1;
  border: 0;
  background: transparent;
  color: #1d1d1f;
  font-size: 15px;
  padding: 9px 0;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
}
.seg-btn.on {
  background: #ffffff;
  font-weight: 600;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.08);
}

.form {
  text-align: left;
}
.field {
  display: block;
  margin-bottom: 16px;
}
.field-label {
  display: block;
  font-size: 13px;
  color: #6e6e73;
  margin-bottom: 7px;
}
.input {
  width: 100%;
  height: 52px;
  border: 1px solid #d2d2d7;
  border-radius: 12px;
  background: #ffffff;
  padding: 0 16px;
  font-size: 16px;
  color: #1d1d1f;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.input::placeholder {
  color: #aeaeb2;
}
.input:focus {
  border-color: #0071e3;
  box-shadow: 0 0 0 4px rgba(0, 113, 227, 0.12);
}
.primary {
  width: 100%;
  height: 52px;
  border: 0;
  border-radius: 12px;
  background: #0071e3;
  color: #ffffff;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  margin-top: 8px;
  transition: background 0.15s ease;
}
.primary:hover {
  background: #0077ed;
}
.primary:disabled {
  opacity: 0.6;
  cursor: default;
}
.link-note {
  margin-top: 18px;
  font-size: 13px;
  color: #6e6e73;
  text-align: center;
}
.link-note a {
  color: #0071e3;
  cursor: pointer;
}
</style>
