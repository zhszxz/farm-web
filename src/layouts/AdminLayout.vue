<template>
  <div class="admin-app">
    <aside class="sidebar">
      <div class="brand">
        <span class="mark">Q</span>
        <div><b>清新果园</b><small>ADMIN CONSOLE</small></div>
      </div>
      <div class="workspace">▣ 平台管理中心 <span>⌄</span></div>
      <small class="nav-label">工作台</small>
      <nav>
        <router-link to="/admin" class="nav-item" exact-active-class="active">
          ▦ 后台概览
        </router-link>
        <router-link to="/admin/shops" class="nav-item" active-class="active">
          ♙ 商家入驻审核 <i v-if="pendingShops > 0">{{ pendingShops }}</i>
        </router-link>
        <router-link to="/admin/products" class="nav-item" active-class="active">
          ▧ 产品内容审核
        </router-link>
        <router-link to="/admin/recommend" class="nav-item" active-class="active">
          ☆ 推荐位管理
        </router-link>
        <router-link to="/admin/users" class="nav-item" active-class="active">
          ♧ 用户管理
        </router-link>
        <router-link to="/admin/dicts" class="nav-item" active-class="active">
          ☷ 字典管理
        </router-link>
        <small class="nav-label mt">数据分析</small>
        <router-link to="/admin/stats" class="nav-item" active-class="active">
          ▤ 平台整体统计
        </router-link>
      </nav>
      <div class="sidebar-bottom">
        <div class="help">
          <b>✦ 需要帮助？</b>
          <p>查看管理后台使用指南</p>
          <a @click="adminToast('使用指南将在正式版开放')">查看指南 →</a>
        </div>
        <div class="sys"><span>● 系统运行正常</span><small>v1.0.0</small></div>
      </div>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="crumb">管理后台 / <b>{{ $route.meta.title }}</b></div>
        <div class="user">
          <button class="bell" @click="adminToast('暂无新通知')">♧</button>
          <span class="avatar">管</span>
          <div>
            <b>平台管理员</b>
            <small>超级管理员</small>
          </div>
          <button class="logout" @click="onLogout">退出</button>
        </div>
      </header>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getOverview } from '../api/modules/admin'
import { adminToast } from '../utils/adminToast'

const router = useRouter()
const auth = useAuthStore()
const pendingShops = ref(0)

onMounted(async () => {
  try {
    const overview = await getOverview()
    pendingShops.value = overview.pendingShopCount || 0
  } catch (e) {
    // 忽略：概览失败不影响导航
  }
})

function onLogout() {
  auth.logout()
  router.replace('/login')
}
</script>
