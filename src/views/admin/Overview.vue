<template>
  <div>
    <div class="heading">
      <div>
        <h1>后台概览</h1>
        <p>欢迎回来，以下是清新果园平台今日运营概况。</p>
      </div>
      <button class="btn" @click="load">↻ 刷新数据</button>
    </div>

    <div v-if="loading" class="loading">加载中…</div>

    <template v-else>
      <div class="metric-grid">
        <div v-for="m in metrics" :key="m.label" class="metric">
          <div class="metric-top">
            {{ m.label }}
            <span class="metric-icon" :style="{ background: m.bg, color: m.fg }">{{ m.icon }}</span>
          </div>
          <div class="metric-value">{{ m.value }}</div>
          <div class="metric-foot">{{ m.foot }}</div>
        </div>
      </div>

      <div class="dash">
        <div>
          <section class="panel">
            <div class="panel-head"><b>待处理商家申请</b></div>
            <div class="table-wrap">
              <table class="table">
                <thead>
                  <tr><th>店铺名称</th><th>申请人</th><th>申请时间</th><th>操作</th></tr>
                </thead>
                <tbody>
                  <tr v-for="s in pendingShops" :key="s.id">
                    <td>{{ s.shopName }}</td>
                    <td>{{ s.contactName || '-' }}</td>
                    <td style="color: #94a3b8">{{ fmtTime(s.createTime) }}</td>
                    <td>
                      <button class="text-btn" @click="go('/admin/shops')">审核详情</button>
                    </td>
                  </tr>
                  <tr v-if="!pendingShops.length">
                    <td colspan="4" class="empty">暂无待处理申请</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div>
          <section class="panel">
            <div class="panel-head"><b>快捷入口</b></div>
            <div class="panel-body">
              <div class="quick">
                <button v-for="q in quickLinks" :key="q.path" @click="go(q.path)">
                  <span class="qicon" :style="{ background: q.bg, color: q.fg }">{{ q.icon }}</span>
                  <div>
                    <b>{{ q.title }}</b>
                    <small>{{ q.desc }}</small>
                  </div>
                  <em>›</em>
                </button>
              </div>
            </div>
          </section>

          <section class="panel" style="margin-top: 16px">
            <div class="panel-head"><b>系统状态</b></div>
            <div class="panel-body">
              <span style="color: #16a34a">● 各项服务运行正常</span>
              <p style="display: flex; justify-content: space-between; color: #94a3b8; font-size: 11px">
                API 服务 <b style="color: #16a34a">正常</b>
              </p>
            </div>
          </section>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getOverview, getClickStats, listShops } from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'

const router = useRouter()
const loading = ref(true)
const overview = ref({})
const clickTotal = ref(0)
const pendingShops = ref([])

const quickLinks = [
  { title: '商家审核', desc: '处理入驻申请', icon: '⏳', bg: '#fff7ed', fg: '#f59e0b', path: '/admin/shops' },
  { title: '产品审核', desc: '上下架与治理', icon: '▧', bg: '#eff6ff', fg: '#3b82f6', path: '/admin/products' },
  { title: '推荐位管理', desc: '配置首页推荐', icon: '☆', bg: '#f5f3ff', fg: '#8b5cf6', path: '/admin/recommend' },
  { title: '用户管理', desc: '账号状态维护', icon: '♧', bg: '#ecfdf3', fg: '#16a34a', path: '/admin/users' },
  { title: '字典管理', desc: '分类与枚举', icon: '☷', bg: '#eff6ff', fg: '#3b82f6', path: '/admin/dicts' },
  { title: '平台统计', desc: '运营数据', icon: '▤', bg: '#ecfeff', fg: '#0891b2', path: '/admin/stats' }
]

const metrics = computed(() => [
  { label: '平台用户数', value: overview.value.userCount ?? '-', icon: '👤', bg: '#eff6ff', fg: '#3b82f6', foot: '累计注册用户' },
  { label: '入驻商家', value: overview.value.shopCount ?? '-', icon: '🏪', bg: '#ecfdf3', fg: '#16a34a', foot: '平台商家' },
  { label: '产品总数', value: overview.value.productCount ?? '-', icon: '📦', bg: '#f5f3ff', fg: '#8b5cf6', foot: '在库产品' },
  { label: '待审核商家', value: overview.value.pendingShopCount ?? '-', icon: '⏳', bg: '#fff7ed', fg: '#f59e0b', foot: '需及时处理' },
  { label: '累计跳转', value: clickTotal.value, icon: '↗', bg: '#eff6ff', fg: '#2563eb', foot: '拼多多引流' }
])

async function load() {
  loading.value = true
  try {
    const [o, c, s] = await Promise.all([
      getOverview(),
      getClickStats(),
      listShops({ page: 1, size: 5, status: 0 })
    ])
    overview.value = o || {}
    clickTotal.value = (c && c.total) || 0
    pendingShops.value = (s && s.records) || []
  } catch (e) {
    adminToast('概览数据加载失败')
  } finally {
    loading.value = false
  }
}

function go(path) {
  router.push(path)
}

function fmtTime(v) {
  if (!v) return '-'
  return String(v).replace('T', ' ').slice(0, 16)
}

onMounted(load)
</script>
