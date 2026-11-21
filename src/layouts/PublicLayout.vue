<template>
  <div class="public-layout">
    <main class="public-main">
      <router-view />
    </main>

    <nav class="bottom-nav" aria-label="底部导航">
      <router-link to="/home" class="nav-item" :class="{ active: isActive('/home') }">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <path d="m3 10 9-7 9 7v11h-7v-7h-4v7H3z" />
          </svg>
        </span>
        <span>首页</span>
      </router-link>
      <router-link to="/category" class="nav-item" :class="{ active: isActive('/category') }">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="2" />
            <rect x="14" y="3" width="7" height="7" rx="2" />
            <rect x="3" y="14" width="7" height="7" rx="2" />
            <rect x="14" y="14" width="7" height="7" rx="2" />
          </svg>
        </span>
        <span>分类</span>
      </router-link>
      <router-link to="/mine" class="nav-item" :class="{ active: isActive('/mine') }">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="7" r="4" />
            <path d="M4 21c0-4 3-7 8-7s8 3 8 7" />
          </svg>
        </span>
        <span>我的</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

function isActive(path) {
  if (path === '/home') return route.path === '/home'
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<style scoped>
.public-layout {
  min-height: 100%;
  padding-bottom: 76px;
  background: linear-gradient(180deg, #edf7ec 0, #f8fbf8 44%, #f3f8f3 100%);
}
.public-main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(480px, 100%);
  height: 76px;
  background: rgba(255, 255, 255, 0.96);
  border-top: 1px solid #e9efe9;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  z-index: 5;
  padding-bottom: env(safe-area-inset-bottom);
  backdrop-filter: blur(12px);
}
.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: transparent;
  color: #858c94;
  font-size: 12px;
  text-decoration: none;
}
.nav-item.active {
  color: #329844;
  font-weight: 700;
}
.nav-icon {
  width: 25px;
  height: 25px;
}
.nav-icon svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
