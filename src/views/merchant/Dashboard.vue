<template>
  <div>
    <div class="page-head">
      <div>
        <h1>早上好，{{ nickname }} 👋</h1>
        <p>欢迎回来，看看今天农场经营情况吧。</p>
      </div>
      <div class="head-actions">
        <button class="btn">{{ year }} 年 ⌄</button>
        <button class="btn primary" @click="go('/merchant/records')">＋ 记一笔销售</button>
      </div>
    </div>

    <div class="grid stats">
      <div v-for="s in stats" :key="s.label" class="card stat">
        <div class="stat-top">
          {{ s.label }}
          <div class="stat-icon" :style="{ background: s.bg, color: s.fg }">{{ s.icon }}</div>
        </div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-foot">{{ s.foot }}</div>
      </div>
    </div>

    <div
      class="card"
      style="margin-bottom: 18px; background: linear-gradient(90deg, #effaf3, #f8fcf9); border-color: #e1f3e7; padding: 15px 19px; display: flex; align-items: center; gap: 12px"
    >
      <span style="font-size: 21px">🌿</span>
      <div>
        <strong style="color: #188447">{{ conclusionTitle }}</strong>
        <span style="color: #587465"> {{ conclusion }}</span>
      </div>
    </div>

    <div class="grid overview-grid">
      <div class="card">
        <div class="card-title"><h3>年度经营趋势</h3><span>销售额 & 成本 · 单位：元</span></div>
        <div class="chart-wrap">
          <div v-if="trend.length" class="bar-chart">
            <div v-for="y in trend" :key="y.year" class="bar-group">
              <div class="bar-pair">
                <div class="bar sales" :style="{ height: y.salesPct + '%' }"></div>
                <div class="bar cost" :style="{ height: y.costPct + '%' }"></div>
              </div>
              <label>{{ y.year }}</label>
            </div>
          </div>
          <div v-else class="chart-empty">暂无数据</div>
        </div>
        <div class="legend">
          <span><i style="background: #18a957"></i>销售额</span>
          <span><i style="background: #f5b544"></i>成本</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>快捷操作</h3><span>常用功能</span></div>
        <div class="grid quick-grid">
          <button v-for="q in quicks" :key="q.label" class="quick" @click="go(q.path)">
            <div class="quick-icon" :style="{ background: q.bg, color: q.fg }">{{ q.icon }}</div>
            <div>
              <strong>{{ q.label }}</strong>
              <small>{{ q.desc }}</small>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="grid bottom-grid">
      <div class="card">
        <div class="card-title">
          <h3>商品管理</h3>
          <button class="btn small" @click="go('/merchant/products')">查看全部 →</button>
        </div>
        <table class="table">
          <thead>
            <tr><th>商品</th><th>分类</th><th>状态</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>
                <div class="product-cell">
                  <div class="thumb">
                    <img v-if="firstImage(p.images)" :src="firstImage(p.images)" alt="" />
                    <span v-else>{{ emoji(p) }}</span>
                  </div>
                  <strong>{{ p.name }}</strong>
                </div>
              </td>
              <td>{{ categoryName(p.categoryId) }}</td>
              <td><span class="status" :class="statusCls(p.status)">{{ statusText(p.status) }}</span></td>
            </tr>
            <tr v-if="!products.length">
              <td colspan="3" style="text-align: center; color: #8b96a5">暂无商品</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card">
        <div class="card-title"><h3>产量概览</h3><span>今年累计</span></div>
        <div v-if="harvest.length" class="harvest-list">
          <div v-for="h in harvest" :key="h.name" class="harvest-row">
            <div class="thumb">{{ h.emoji }}</div>
            <div class="harvest-info">
              <strong>{{ h.name }}</strong>
              <small>{{ h.qty }} {{ h.unit }}</small>
              <div class="progress"><span :style="{ width: h.pct + '%' }"></span></div>
            </div>
            <div class="harvest-amount">{{ h.pct }}%</div>
          </div>
        </div>
        <div v-else style="color: #8b96a5; text-align: center; padding: 20px 0">暂无产量记录</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { listProducts, listProductions } from '../../api/modules/merchant'
import { getProfit } from '../../api/modules/report'
import { getCategories } from '../../api/modules/product'
import { firstImage, categoryEmoji, formatMoney } from '../../utils/format'

const router = useRouter()
const auth = useAuthStore()
const year = new Date().getFullYear()
const nickname = computed(() => (auth.user && auth.user.nickname) || '商家')

const profit = ref([])
const products = ref([])
const categories = ref([])
const productions = ref([])

const catMap = computed(() => {
  const m = {}
  categories.value.forEach((c) => {
    m[c.id] = c.name
  })
  return m
})

function categoryName(id) {
  return catMap.value[id] || '-'
}
function emoji(p) {
  return categoryEmoji(categoryName(p.categoryId))
}
function statusText(s) {
  return { 0: '草稿', 1: '上架中', 2: '已下架' }[s] || '-'
}
function statusCls(s) {
  return s === 0 ? 'draft' : s === 1 ? '' : 'off'
}

const current = computed(() => profit.value.find((x) => x.year === year) || {})
const lastYear = computed(() => profit.value.find((x) => x.year === year - 1) || {})

const totalProduction = computed(() =>
  productions.value.reduce((sum, r) => sum + Number(r.quantity || 0), 0)
)

const stats = computed(() => [
  {
    label: '本年销售额',
    value: '¥ ' + formatMoney(current.value.salesAmount || 0),
    icon: '↗',
    bg: '#e8f8ef',
    fg: '#18a957',
    foot: '本年度销售汇总'
  },
  {
    label: '本年成本',
    value: '¥ ' + formatMoney(current.value.costAmount || 0),
    icon: '▤',
    bg: '#fff4e4',
    fg: '#e89a25',
    foot: '本年度成本汇总'
  },
  {
    label: '本年利润',
    value: '¥ ' + formatMoney(current.value.profit || 0),
    icon: '◈',
    bg: '#eaf2ff',
    fg: '#4b87e8',
    foot: current.value.profitRate != null ? '利润率 ' + current.value.profitRate + '%' : '—'
  },
  {
    label: '本年总产量',
    value: formatMoney(totalProduction.value) + ' 斤',
    icon: '♧',
    bg: '#f2eaff',
    fg: '#9161dc',
    foot: '本年度产量汇总'
  }
])

const conclusionTitle = computed(() => {
  const diff = Number(current.value.profit || 0) - Number(lastYear.value.profit || 0)
  if (!lastYear.value.profit) return '开始记录经营数据吧！'
  return diff >= 0 ? '经营表现不错！' : '成本需要关注'
})
const conclusion = computed(() => {
  if (!lastYear.value.profit) return '录入销售、产量与成本后，这里会展示经营结论。'
  const diff = Number(current.value.profit || 0) - Number(lastYear.value.profit || 0)
  const pct = Math.abs((diff / Number(lastYear.value.profit)) * 100).toFixed(1)
  return diff >= 0
    ? `今年利润比去年增长 ${pct}%，继续保持良好势头。`
    : `今年利润比去年下降 ${pct}%，注意控制成本。`
})

const trend = computed(() => {
  const list = profit.value.slice().sort((a, b) => a.year - b.year)
  const max = Math.max(1, ...list.map((x) => Math.max(Number(x.salesAmount || 0), Number(x.costAmount || 0))))
  return list.map((x) => ({
    year: x.year,
    salesPct: Math.round((Number(x.salesAmount || 0) / max) * 100),
    costPct: Math.round((Number(x.costAmount || 0) / max) * 100)
  }))
})

const quicks = [
  { label: '记一笔销售', desc: '录入销售记录', icon: '＋', bg: '#eaf8ef', fg: '#16a34a', path: '/merchant/records' },
  { label: '录产量', desc: '今年的产量', icon: '🌾', bg: '#f2eaff', fg: '#9161dc', path: '/merchant/records' },
  { label: '录成本', desc: '农资与人工', icon: '¥', bg: '#fff4e4', fg: '#e89a25', path: '/merchant/records' },
  { label: '看报表', desc: '经营数据图表', icon: '▥', bg: '#eaf2ff', fg: '#4b87e8', path: '/merchant/reports' },
  { label: '管商品', desc: '上下架产品', icon: '🥬', bg: '#eaf8ef', fg: '#16a34a', path: '/merchant/products' },
  { label: '店铺设置', desc: '资料与链接', icon: '⚙', bg: '#f1f4f5', fg: '#64748b', path: '/merchant/shop' }
]

const harvest = computed(() => {
  const map = {}
  productions.value.forEach((r) => {
    const key = r.categoryId
    if (!map[key]) map[key] = { name: categoryName(key), emoji: categoryEmoji(categoryName(key)), qty: 0, unit: r.unit || '' }
    map[key].qty += Number(r.quantity || 0)
  })
  const list = Object.values(map)
  const total = list.reduce((s, x) => s + x.qty, 0) || 1
  return list.map((x) => ({ ...x, pct: Math.round((x.qty / total) * 100) }))
})

async function load() {
  try {
    const [p, prods, cats, productionsRes] = await Promise.all([
      getProfit({ startYear: year - 2, endYear: year }),
      listProducts({ page: 1, size: 5 }),
      getCategories(),
      listProductions({ page: 1, size: 500, year })
    ])
    profit.value = p || []
    products.value = (prods && prods.records) || []
    categories.value = cats || []
    productions.value = (productionsRes && productionsRes.records) || []
  } catch (e) {
    // 拦截器已提示
  }
}

function go(path) {
  router.push(path)
}

onMounted(load)
</script>

<style scoped>
.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 10px 0 22px;
}
.bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
  position: relative;
}
.bar-pair {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  height: 100%;
}
.bar {
  width: 22px;
  border-radius: 5px 5px 0 0;
  min-height: 2px;
}
.bar.sales {
  background: linear-gradient(#34c07a, #18a957);
}
.bar.cost {
  background: linear-gradient(#f8c766, #f5b544);
}
.bar-group label {
  position: absolute;
  bottom: -20px;
  font-size: 12px;
  color: #8b96a5;
}
.chart-empty {
  display: grid;
  place-items: center;
  height: 100%;
  color: #8b96a5;
}
</style>
