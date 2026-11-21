<template>
  <div>
    <div class="heading">
      <div>
        <h1>平台整体统计</h1>
        <p>查看平台运营数据与产品引流效果。</p>
      </div>
      <button class="btn" @click="load">↻ 刷新</button>
    </div>

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

    <div class="chart-grid">
      <section class="panel">
        <div class="panel-head"><b>商家跳转量排行</b></div>
        <div class="panel-body">
          <div v-if="!barItems.length" class="empty">暂无跳转数据</div>
          <div v-else class="bars">
            <div v-for="b in barItems" :key="b.id" class="bargrp">
              <div class="bar" :style="{ height: b.height + '%' }"></div>
              <label>{{ b.name }}</label>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-head"><b>引流数据明细</b></div>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>商家</th><th>跳转次数</th><th>占比</th></tr></thead>
            <tbody>
              <tr v-for="b in byShop" :key="b.id">
                <td>{{ shopName(b.id) }}</td>
                <td>{{ b.count }}</td>
                <td>{{ percent(b.count) }}%</td>
              </tr>
              <tr v-if="!byShop.length"><td colspan="3" class="empty">暂无数据</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getOverview, getClickStats, listShops } from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'

const overview = ref({})
const stats = ref({ total: 0, byShop: [] })
const shopMap = ref({})

const metrics = computed(() => [
  { label: '平台用户数', value: overview.value.userCount ?? '-', icon: '👤', bg: '#eff6ff', fg: '#3b82f6', foot: '累计注册用户' },
  { label: '入驻商家', value: overview.value.shopCount ?? '-', icon: '🏪', bg: '#ecfdf3', fg: '#16a34a', foot: '平台商家' },
  { label: '产品总数', value: overview.value.productCount ?? '-', icon: '📦', bg: '#f5f3ff', fg: '#8b5cf6', foot: '在库产品' },
  { label: '累计跳转', value: stats.value.total ?? '-', icon: '↗', bg: '#ecfeff', fg: '#0891b2', foot: '拼多多引流' }
])

const byShop = computed(() => (stats.value.byShop || []).slice(0, 7))

const barItems = computed(() => {
  const list = byShop.value
  const max = Math.max(1, ...list.map((x) => x.count || 0))
  return list.map((x) => ({
    id: x.id,
    name: shopName(x.id),
    height: Math.round(((x.count || 0) / max) * 100)
  }))
})

function shopName(id) {
  return shopMap.value[id] || `商家 #${id}`
}
function percent(count) {
  const total = stats.value.total || 0
  if (!total) return 0
  return ((count / total) * 100).toFixed(1)
}

async function load() {
  try {
    const [o, c, shops] = await Promise.all([
      getOverview(),
      getClickStats(),
      listShops({ page: 1, size: 500 })
    ])
    overview.value = o || {}
    stats.value = c || { total: 0, byShop: [] }
    const sm = {}
    ;(shops && shops.records ? shops.records : []).forEach((s) => {
      sm[s.id] = s.shopName
    })
    shopMap.value = sm
  } catch (e) {
    adminToast('统计加载失败')
  }
}

onMounted(load)
</script>
