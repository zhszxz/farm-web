<template>
  <div class="merchant-app">
    <!-- 侧栏（桌面） -->
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">🌱</div>清新果园</div>
      <nav class="nav">
        <button
          v-for="n in navs"
          :key="n.path"
          :class="{ active: isActive(n) }"
          @click="go(n.path)"
        >
          <span class="nav-icon">{{ n.icon }}</span>{{ n.label }}
        </button>
      </nav>
      <div class="sidebar-bottom">
        <button class="btn" style="width: 100%; background: none; border: 0; color: #718096; text-align: left; padding: 12px 14px" @click="onLogout">
          ⇥ 退出登录
        </button>
        <div class="profile-mini">
          <div class="avatar">{{ avatarText }}</div>
          <div>
            <strong style="color: #334155">{{ nickname }}</strong>
            <small style="display: block; margin-top: 3px">{{ shopName }} · 商家</small>
          </div>
        </div>
      </div>
    </aside>

    <main class="main">
      <!-- 顶栏（桌面） -->
      <header class="topbar">
        <div class="search">
          <input placeholder="搜索商品、记录或报表..." />
        </div>
        <div class="top-actions">
          <button class="icon-btn" @click="merchantToast('暂无新通知')">♧<i class="dot"></i></button>
          <div class="user">
            <div class="avatar">{{ avatarText }}</div>
            <div>
              <strong>{{ nickname }}</strong>
              <small>{{ shopName }}</small>
            </div>
            ⌄
          </div>
        </div>
      </header>

      <!-- 移动顶栏 -->
      <header class="mobile-top">
        <div class="mobile-brand"><div class="brand-mark">🌱</div>清新果园</div>
        <button class="icon-btn" @click="merchantToast('暂无新通知')">♧<i class="dot"></i></button>
      </header>

      <div class="content">
        <router-view />
      </div>
    </main>

    <!-- 移动底栏 -->
    <nav class="mobile-nav">
      <button
        v-for="n in navs"
        :key="'m-' + n.path"
        :class="{ active: isActive(n) }"
        @click="go(n.path)"
      >
        <span>{{ n.icon }}</span>{{ n.short }}
      </button>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getShop } from '../api/modules/merchant'
import { merchantToast } from '../utils/merchantToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const shopName = ref('我的店铺')

const navs = [
  { path: '/merchant', label: '工作台', short: '工作台', icon: '▦', end: true },
  { path: '/merchant/products', label: '商品管理', short: '商品', icon: '🥬' },
  { path: '/merchant/records', label: '经营记录', short: '记录', icon: '▤' },
  { path: '/merchant/reports', label: '经营报表', short: '报表', icon: '▥' },
  { path: '/merchant/shop', label: '我的店铺', short: '我的', icon: '♙' }
]

const nickname = computed(() => (auth.user && auth.user.nickname) || '商家')
const avatarText = computed(() => (nickname.value || '商').slice(0, 1))

function isActive(n) {
  if (n.end) return route.path === n.path
  return route.path === n.path || route.path.startsWith(n.path + '/')
}
function go(path) {
  router.push(path)
}
function onLogout() {
  auth.logout()
  router.replace('/login')
}

onMounted(async () => {
  try {
    const shop = await getShop()
    if (shop && shop.shopName) shopName.value = shop.shopName
  } catch (e) {
    // 忽略：未过审或未登录时展示默认名
  }
})
</script>
