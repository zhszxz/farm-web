<template>
  <div class="mine-shell">
    <!-- 状态栏（原型装饰） -->
    <div class="status-bar">
      <span>9:41</span>
      <span class="status-icons">▮▮▮ ◉ ▰</span>
    </div>

    <!-- 个人资料 Hero -->
    <section class="profile-hero">
      <div class="hero-bg"></div>
      <div class="hero-glow"></div>

      <div
        class="profile-row"
        role="button"
        tabindex="0"
        aria-label="个人资料"
        @click="onProfile"
        @keydown.enter="onProfile"
      >
        <div class="avatar-wrap">
          <div class="avatar">
            <svg viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="23" r="12" />
              <path d="M10 55c2-13 11-20 22-20s20 7 22 20" />
            </svg>
          </div>
          <span class="avatar-edit">✎</span>
        </div>

        <div class="profile-text">
          <h1>{{ displayName }}</h1>
          <p>{{ subtitle }} <span class="arrow">›</span></p>
          <div class="profile-chip"><span class="leaf">❧</span> 与自然相遇，发现新鲜好味</div>
        </div>

        <button class="profile-arrow" aria-label="查看个人资料" @click.stop="onProfile">›</button>
      </div>

      <div class="hero-deco deco-one">✦</div>
      <div class="hero-deco deco-two">✧</div>
    </section>

    <!-- 我的服务 -->
    <section class="content">
      <div class="section-heading">
        <div>
          <h2>我的服务</h2>
          <p>记录你的果园生活</p>
        </div>
        <span class="heading-leaf">❧</span>
      </div>

      <div class="service-list">
        <button class="service-card" aria-label="我的收藏" @click="onService('favorites')">
          <div class="service-icon icon-favorite">
            <svg viewBox="0 0 48 48">
              <path d="M24 40 8.5 25.2C1 17.8 12 5.5 24 15.2 36 5.5 47 17.8 39.5 25.2Z" />
            </svg>
          </div>
          <div class="service-copy">
            <h3>我的收藏</h3>
            <p>收藏喜欢的农产品与果园</p>
          </div>
          <span class="chevron">›</span>
        </button>

        <button class="service-card" aria-label="我的留言" @click="onService('messages')">
          <div class="service-icon icon-message">
            <svg viewBox="0 0 48 48">
              <path d="M8 10h32v24H21l-9 7v-7H8z" />
              <path d="M16 19h16M16 25h11" />
            </svg>
          </div>
          <div class="service-copy">
            <h3>我的留言</h3>
            <p>查看咨询与互动记录</p>
          </div>
          <span class="chevron">›</span>
        </button>

        <!-- 店铺管理（商家） -->
        <button
          v-if="showMerchantManage"
          class="service-card merchant-card"
          aria-label="店铺管理"
          @click="go('/merchant')"
        >
          <div class="service-icon icon-merchant">
            <svg viewBox="0 0 48 48">
              <path d="M7 20 11 9h26l4 11" />
              <path d="M8 20c0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0" />
              <path d="M11 23v17h26V23M18 40V28h12v12" />
            </svg>
          </div>
          <div class="service-copy">
            <h3>店铺管理</h3>
            <p>管理你的店铺、产品与经营数据</p>
          </div>
          <span class="chevron">›</span>
        </button>

        <!-- 申请成为商家（普通用户 + 商家） -->
        <button
          v-if="showApply"
          class="service-card merchant-card"
          aria-label="申请成为商家"
          @click="go('/apply')"
        >
          <div class="service-icon icon-merchant">
            <svg viewBox="0 0 48 48">
              <path d="M7 20 11 9h26l4 11" />
              <path d="M8 20c0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0 0 5 8 5 8 0" />
              <path d="M11 23v17h26V23M18 40V28h12v12" />
            </svg>
          </div>
          <div class="service-copy">
            <h3>申请成为商家</h3>
            <p>加入果园，让优质农产品被看见</p>
          </div>
          <span class="chevron">›</span>
          <span class="merchant-badge">入驻</span>
        </button>

        <!-- 管理后台（管理员） -->
        <button
          v-if="showAdmin"
          class="service-card merchant-card"
          aria-label="管理后台"
          @click="go('/admin')"
        >
          <div class="service-icon icon-admin">
            <svg viewBox="0 0 48 48">
              <path d="M24 6 40 12v12c0 9-7 15-16 18-9-3-16-9-16-18V12z" />
              <path d="m17 24 5 5 9-10" />
            </svg>
          </div>
          <div class="service-copy">
            <h3>管理后台</h3>
            <p>审核商家、产品与平台管理</p>
          </div>
          <span class="chevron">›</span>
          <span class="merchant-badge">管理</span>
        </button>
      </div>

      <button v-if="loggedIn" class="logout-btn" @click="onLogout">退出登录</button>

      <div class="bottom-note">
        <span class="note-leaf">✦</span>
        <p>源自自然 · 健康美味</p>
        <span>清新果园</span>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()

const loggedIn = computed(() => auth.isLoggedIn)
const displayName = computed(() =>
  auth.user && auth.user.nickname ? auth.user.nickname : loggedIn.value ? '用户' : '点击登录'
)
const subtitle = computed(() =>
  loggedIn.value ? '欢迎来到清新果园' : '登录后收藏、留言与申请商家'
)

// 普通用户与商家都展示「申请成为商家」；商家额外展示「店铺管理」；管理员展示「管理后台」
const showMerchantManage = computed(() => auth.role === 2)
const showApply = computed(() => auth.role === 1 || auth.role === 2)
const showAdmin = computed(() => auth.role === 3)

onMounted(async () => {
  if (auth.isLoggedIn && !auth.user) {
    try {
      await auth.fetchMe()
    } catch (e) {
      auth.logout()
    }
  }
})

function onProfile() {
  if (!loggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/mine' } })
    return
  }
  showToast('个人资料编辑功能开发中')
}

function onService(key) {
  if (!loggedIn.value) {
    router.push({ path: '/login', query: { redirect: '/mine' } })
    return
  }
  const routes = { favorites: '/favorites', messages: '/messages' }
  router.push(routes[key] || '/mine')
}

function go(path) {
  router.push(path)
}

async function onLogout() {
  try {
    await showConfirmDialog({
      title: '退出登录',
      message: '确定要退出当前账号吗？',
      confirmButtonText: '退出',
      cancelButtonText: '取消'
    })
  } catch (e) {
    return
  }
  auth.logout()
  router.replace('/home')
}
</script>

<style scoped>
.mine-shell {
  max-width: 480px;
  min-height: 100vh;
  margin: 0 auto;
  padding-bottom: 24px;
  overflow: hidden;
}

/* ===== 状态栏 ===== */
.status-bar {
  height: 38px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 18px;
  font-size: 16px;
  font-weight: 700;
  color: #202628;
}
.status-icons {
  font-size: 14px;
}

/* ===== 个人资料 Hero ===== */
.profile-hero {
  position: relative;
  margin: 6px -16px 0;
  padding: 26px 24px 24px;
  min-height: 220px;
  overflow: hidden;
  border-radius: 0 0 28px 28px;
  background: linear-gradient(135deg, #dcefd9, #c4e5c0 60%, #edf7e9);
}
.hero-bg {
  position: absolute;
  inset: 0;
  background-image: url('/images/hero.jpg');
  background-size: cover;
  background-position: center;
  opacity: 0.16;
  mix-blend-mode: multiply;
}
.hero-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    rgba(233, 247, 231, 0.96),
    rgba(225, 242, 221, 0.65) 70%,
    rgba(218, 239, 215, 0.5)
  );
}
.profile-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
  cursor: pointer;
}
.avatar-wrap {
  position: relative;
  flex: none;
}
.avatar {
  width: 86px;
  height: 86px;
  border-radius: 50%;
  background: linear-gradient(145deg, #fff, #e0f1dc);
  box-shadow: 0 8px 20px rgba(49, 127, 56, 0.13);
  display: grid;
  place-items: center;
  border: 3px solid rgba(255, 255, 255, 0.8);
}
.avatar svg {
  width: 54px;
  height: 54px;
  fill: none;
  stroke: #68a96d;
  stroke-width: 2.3;
  stroke-linecap: round;
}
.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 2px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3ca34b;
  color: #fff;
  border: 2px solid #e8f5e6;
  font-size: 12px;
  display: grid;
  place-items: center;
}
.profile-text {
  min-width: 0;
  flex: 1;
}
.profile-text h1 {
  font-size: 23px;
  margin: 0 0 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.profile-text p {
  font-size: 14px;
  color: #638267;
  margin: 0;
}
.arrow {
  font-size: 22px;
  vertical-align: -1px;
  color: #43894b;
}
.profile-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-top: 13px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 20px;
  padding: 7px 10px;
  font-size: 11px;
  color: #58855c;
}
.leaf {
  font-size: 15px;
  color: #3b9e47;
}
.profile-arrow {
  font-size: 32px;
  background: transparent;
  color: #57945b;
  padding: 0 0 0 4px;
  border: 0;
  cursor: pointer;
}
.hero-deco {
  position: absolute;
  color: #fff;
  font-size: 42px;
  opacity: 0.45;
}
.deco-one {
  right: 22px;
  top: 18px;
}
.deco-two {
  right: 72px;
  bottom: 12px;
  font-size: 26px;
}

/* ===== 我的服务 ===== */
.content {
  padding: 24px 2px 0;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 4px 16px;
}
.section-heading h2 {
  font-size: 20px;
  margin: 0;
  font-weight: 800;
}
.section-heading p {
  font-size: 12px;
  color: #9aa19b;
  margin: 5px 0 0;
}
.heading-leaf {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #e0f2dc;
  color: #47a34d;
  display: grid;
  place-items: center;
  font-size: 22px;
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.service-card {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  text-align: left;
  padding: 16px 15px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 8px 24px rgba(42, 102, 47, 0.07);
  min-height: 94px;
  transition: transform 0.15s, box-shadow 0.15s;
  border: 0;
  cursor: pointer;
}
.service-card:active {
  transform: scale(0.985);
  box-shadow: 0 4px 14px rgba(42, 102, 47, 0.1);
}
.service-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  flex: none;
  margin-right: 14px;
}
.service-icon svg {
  width: 30px;
  height: 30px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.icon-favorite {
  background: #fff2e7;
  color: #f1a342;
}
.icon-message {
  background: #eaf4ff;
  color: #5799e5;
}
.icon-merchant {
  background: #e7f7eb;
  color: #39a96a;
}
.icon-admin {
  background: #eef1fd;
  color: #5b6fd6;
}
.service-copy {
  flex: 1;
  min-width: 0;
}
.service-copy h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 6px;
}
.service-copy p {
  font-size: 12px;
  color: #a0a5aa;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.chevron {
  font-size: 26px;
  color: #b6bdba;
  padding-left: 8px;
  font-weight: 300;
}
.merchant-badge {
  position: absolute;
  right: 43px;
  top: 14px;
  background: #e7f7e9;
  color: #3a9c48;
  font-size: 10px;
  padding: 3px 7px;
  border-radius: 10px;
}
.bottom-note {
  text-align: center;
  margin-top: 36px;
  color: #a5b3a5;
  font-size: 12px;
}
.bottom-note p {
  display: inline;
  margin: 0 7px;
}
.bottom-note > span:last-child {
  display: block;
  margin-top: 8px;
  font-size: 10px;
  letter-spacing: 2px;
  color: #bac6ba;
}
.note-leaf {
  color: #8cc88b;
}
.logout-btn {
  width: 100%;
  height: 48px;
  margin-top: 16px;
  background: #fff;
  border: 1px solid #e8eee8;
  border-radius: 16px;
  color: #e05a4f;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
</style>
