<template>
  <div>
    <div class="page-head">
      <div>
        <h1>经营报表</h1>
        <p>用简单直观的数据图表，了解农场经营表现。</p>
      </div>
      <div class="head-actions">
        <button class="btn" @click="onExport">⇩ 导出 Excel</button>
      </div>
    </div>

    <div class="filters">
      <div class="segmented report-tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          :class="{ active: active === t.key }"
          @click="switchTab(t.key)"
        >
          {{ t.label }}
        </button>
      </div>
      <select v-model.number="startYear">
        <option v-for="y in yearOptions" :key="'s' + y" :value="y">{{ y }} 起</option>
      </select>
      <select v-model.number="endYear">
        <option v-for="y in yearOptions" :key="'e' + y" :value="y">{{ y }} 止</option>
      </select>
      <div v-if="active === 'trend'" class="trend-cat">
        <VarietySelect
          v-model="trendCategory"
          :label="trendCategory ? categoryName(trendCategory) : ''"
          placeholder="选择品种"
        />
      </div>
    </div>

    <div v-if="loading" class="card" style="text-align: center; color: #8b96a5">加载中…</div>

    <div v-else class="grid report-grid">
      <!-- 利润核算 -->
      <template v-if="active === 'profit'">
        <div class="card report-card">
          <div class="card-title"><h3>年度利润核算</h3><span>{{ startYear }} – {{ endYear }}</span></div>
          <div class="chart-wrap">
            <div v-if="profit.length" class="bar-chart">
              <div
                v-for="p in profit"
                :key="p.year"
                class="bar-group"
                :class="{ selected: selectedYear === p.year }"
                @click="toggleYear(p.year)"
              >
                <div v-if="selectedYear === p.year" class="bar-tip">
                  <div class="tip-row">
                    <span>销售额</span><strong>¥ {{ formatMoney(p.salesAmount) }}</strong>
                  </div>
                  <div class="tip-row">
                    <span>成本</span><strong>¥ {{ formatMoney(p.costAmount) }}</strong>
                  </div>
                  <div class="tip-row">
                    <span>利润较上年</span>
                    <strong :class="changeClass(p.year)">{{ changeText(p.year) }}</strong>
                  </div>
                </div>
                <div class="bar-pair">
                  <div class="bar sales" :style="{ height: p.salesPct + '%' }"></div>
                  <div class="bar cost" :style="{ height: p.costPct + '%' }"></div>
                </div>
                <label>{{ p.year }}</label>
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
          <div class="card-title"><h3>利润明细</h3><span>利润率 = 利润 / 销售额</span></div>
          <div class="profit-table-wrap">
            <table class="table">
              <thead><tr><th>年份</th><th>销售额</th><th>成本</th><th>利润</th><th>利润率</th></tr></thead>
              <tbody>
                <tr v-for="p in profit" :key="p.year">
                  <td>{{ p.year }}</td>
                  <td>¥ {{ formatMoney(p.salesAmount) }}</td>
                  <td>¥ {{ formatMoney(p.costAmount) }}</td>
                  <td>¥ {{ formatMoney(p.profit) }}</td>
                  <td>{{ p.profitRate != null ? p.profitRate + '%' : '-' }}</td>
                </tr>
                <tr v-if="!profit.length"><td colspan="5" style="text-align: center; color: #8b96a5">暂无数据</td></tr>
              </tbody>
            </table>
          </div>
          <div class="profit-list">
            <div v-for="p in profit" :key="'m' + p.year" class="profit-item">
              <div class="profit-year">{{ p.year }} 年</div>
              <div class="profit-row"><span>销售额</span><strong>¥ {{ formatMoney(p.salesAmount) }}</strong></div>
              <div class="profit-row"><span>成本</span><strong>¥ {{ formatMoney(p.costAmount) }}</strong></div>
              <div class="profit-row"><span>利润</span><strong>¥ {{ formatMoney(p.profit) }}</strong></div>
              <div class="profit-row"><span>利润率</span><strong>{{ p.profitRate != null ? p.profitRate + '%' : '-' }}</strong></div>
            </div>
            <div v-if="!profit.length" class="empty-tip">暂无数据</div>
          </div>
        </div>
      </template>

      <!-- 单品趋势 -->
      <template v-else-if="active === 'trend'">
        <div class="card report-card" style="grid-column: 1 / -1">
          <div class="card-title"><h3>单品跨年趋势</h3><span>产量 / 销量 / 销售额</span></div>
          <div v-if="!trendCategory" style="color: #8b96a5; padding: 20px 0">请先选择品种</div>
          <div v-else class="bar-list" style="margin-top: 10px">
            <div v-for="t in trendData" :key="t.year" class="bar-row">
              <span>{{ t.year }} 年</span>
              <div class="progress"><span :style="{ width: t.pct + '%' }"></span></div>
              <strong>{{ formatMoney(t.salesAmount) }}</strong>
            </div>
            <div v-if="!trendData.length" style="color: #8b96a5">暂无数据</div>
          </div>
        </div>
      </template>

      <!-- 产品对比 -->
      <template v-else-if="active === 'product'">
        <div class="card report-card" style="grid-column: 1 / -1">
          <div class="card-title"><h3>产品销售额对比</h3><span>{{ endYear }} 年</span></div>
          <div class="bar-list" style="margin-top: 10px">
            <div v-for="x in productCompare" :key="x.id" class="bar-row">
              <span>{{ x.name }}</span>
              <div class="progress"><span :style="{ width: pctOf(x.amount, productCompare) + '%' }"></span></div>
              <strong>{{ formatMoney(x.amount) }}</strong>
            </div>
            <div v-if="!productCompare.length" style="color: #8b96a5">暂无数据</div>
          </div>
        </div>
      </template>

      <!-- 渠道占比 -->
      <template v-else-if="active === 'channel'">
        <div class="card report-card">
          <div class="card-title"><h3>销售渠道占比</h3><span>{{ endYear }} 年</span></div>
          <div class="donut" :style="{ background: donutBg(channelShare) }"></div>
          <div class="donut-labels">
            <div v-for="x in channelShare" :key="x.id">
              <span>{{ x.name }}</span><strong>{{ pctOf(x.amount, channelShare) }}%</strong>
            </div>
            <div v-if="!channelShare.length" style="color: #8b96a5">暂无数据</div>
          </div>
        </div>
      </template>

      <!-- 大类占比 -->
      <template v-else-if="active === 'category'">
        <div class="card report-card">
          <div class="card-title"><h3>大类销售额占比</h3><span>{{ endYear }} 年</span></div>
          <div class="donut" :style="{ background: donutBg(categoryShare) }"></div>
          <div class="donut-labels">
            <div v-for="x in categoryShare" :key="x.id">
              <span>{{ x.name }}</span><strong>{{ pctOf(x.amount, categoryShare) }}%</strong>
            </div>
            <div v-if="!categoryShare.length" style="color: #8b96a5">暂无数据</div>
          </div>
        </div>
      </template>

      <!-- 销售排行 -->
      <template v-else>
        <div class="card report-card" style="grid-column: 1 / -1">
          <div class="card-title"><h3>销售额排行 TOP 10</h3><span>全周期</span></div>
          <div class="bar-list" style="margin-top: 10px">
            <div v-for="x in topList" :key="x.id" class="bar-row">
              <span>{{ x.name }}</span>
              <div class="progress"><span :style="{ width: pctOf(x.amount, topList) + '%' }"></span></div>
              <strong>{{ formatMoney(x.amount) }}</strong>
            </div>
            <div v-if="!topList.length" style="color: #8b96a5">暂无数据</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import {
  getProfit,
  getTrend,
  getProductCompare,
  getChannelShare,
  getCategoryShare,
  getTop,
  exportProfit
} from '../../api/modules/report'
import { getCategories } from '../../api/modules/product'
import VarietySelect from '../../components/VarietySelect.vue'
import { merchantToast } from '../../utils/merchantToast'
import { formatMoney } from '../../utils/format'

const tabs = [
  { key: 'profit', label: '利润核算' },
  { key: 'trend', label: '单品趋势' },
  { key: 'product', label: '产品对比' },
  { key: 'channel', label: '渠道占比' },
  { key: 'category', label: '大类占比' },
  { key: 'top', label: '销售排行' }
]
const active = ref('profit')
const yearOptions = [2026, 2025, 2024, 2023, 2022]
const startYear = ref(new Date().getFullYear() - 2)
const endYear = ref(new Date().getFullYear())
const loading = ref(false)
const categories = ref([])
const trendCategory = ref('')

const profit = ref([])
const trendData = ref([])
const productCompare = ref([])
const channelShare = ref([])
const categoryShare = ref([])
const topList = ref([])
const selectedYear = ref(null)

function toggleYear(y) {
  selectedYear.value = selectedYear.value === y ? null : y
}

/** 利润较上年变化率（%），无上年数据返回 null */
function profitChange(year) {
  const cur = profit.value.find((p) => p.year === year)
  const prev = profit.value.find((p) => p.year === year - 1)
  if (!cur || !prev) return null
  const prevProfit = Number(prev.profit || 0)
  if (!prevProfit) return null
  return ((Number(cur.profit || 0) - prevProfit) / prevProfit) * 100
}

function changeText(year) {
  const c = profitChange(year)
  if (c === null) return '—'
  return (c >= 0 ? '↑ ' : '↓ ') + Math.abs(c).toFixed(1) + '%'
}

function changeClass(year) {
  const c = profitChange(year)
  if (c === null) return ''
  return c >= 0 ? 'up' : 'down'
}

function pctOf(amount, list) {
  const total = list.reduce((s, x) => s + Number(x.amount || 0), 0) || 1
  return Math.round((Number(amount || 0) / total) * 100)
}

function donutBg(list) {
  if (!list.length) return '#edf1f3'
  const total = list.reduce((s, x) => s + Number(x.amount || 0), 0) || 1
  const colors = ['#18a957', '#83d5a3', '#f8bd52', '#8b5cf6', '#3b82f6', '#f59e0b']
  let acc = 0
  const stops = list.map((x, i) => {
    const start = acc
    acc += (Number(x.amount || 0) / total) * 100
    return `${colors[i % colors.length]} ${start}% ${acc}%`
  })
  return `conic-gradient(${stops.join(',')})`
}

async function load() {
  loading.value = true
  try {
    if (active.value === 'profit') {
      const list = (await getProfit({ startYear: startYear.value, endYear: endYear.value })) || []
      const max = Math.max(1, ...list.map((x) => Math.max(Number(x.salesAmount || 0), Number(x.costAmount || 0))))
      profit.value = list.map((x) => ({
        ...x,
        salesPct: Math.round((Number(x.salesAmount || 0) / max) * 100),
        costPct: Math.round((Number(x.costAmount || 0) / max) * 100)
      }))
    } else if (active.value === 'trend') {
      if (!trendCategory.value) {
        trendData.value = []
      } else {
        const list = (await getTrend({ categoryId: trendCategory.value, startYear: startYear.value, endYear: endYear.value })) || []
        const max = Math.max(1, ...list.map((x) => Number(x.salesAmount || 0)))
        trendData.value = list.map((x) => ({
          ...x,
          pct: Math.round((Number(x.salesAmount || 0) / max) * 100)
        }))
      }
    } else if (active.value === 'product') {
      productCompare.value = (await getProductCompare({ year: endYear.value })) || []
    } else if (active.value === 'channel') {
      channelShare.value = (await getChannelShare({ year: endYear.value })) || []
    } else if (active.value === 'category') {
      categoryShare.value = (await getCategoryShare({ year: endYear.value })) || []
    } else {
      topList.value = (await getTop({ topN: 10 })) || []
    }
  } catch (e) {
    merchantToast('报表加载失败')
  } finally {
    loading.value = false
  }
}

function switchTab(k) {
  active.value = k
  load()
}

// 选择品种后立即重新查询趋势数据
watch(trendCategory, () => {
  if (active.value === 'trend') load()
})

async function onExport() {
  try {
    const res = await exportProfit({ startYear: startYear.value, endYear: endYear.value })
    const blob = res.data instanceof Blob ? res.data : new Blob([res.data])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profit-report.xlsx'
    a.click()
    URL.revokeObjectURL(url)
    merchantToast('报表已开始下载')
  } catch (e) {
    merchantToast('导出失败')
  }
}

onMounted(async () => {
  try {
    categories.value = (await getCategories()) || []
  } catch (e) {
    // 忽略
  }
  load()
})
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
  cursor: pointer;
}
.bar-tip {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #173b28;
  color: #fff;
  border-radius: 8px;
  padding: 6px 9px;
  font-size: 11px;
  line-height: 1.7;
  white-space: nowrap;
  z-index: 5;
  box-shadow: 0 6px 16px rgba(15, 42, 28, 0.2);
}
.bar-tip::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -5px;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #173b28;
}
.tip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.tip-row span {
  color: #b9d3c4;
}
.tip-row strong.up {
  color: #7fe0a8;
}
.tip-row strong.down {
  color: #ffb0a3;
}
.bar-group.selected label {
  color: #128747;
  font-weight: 650;
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

/* 报表 Tab：移动端换行，避免竖排 / 横向滚动 */
.report-tabs {
  flex-wrap: wrap;
}
.report-tabs button {
  flex: none;
  white-space: nowrap;
}
.trend-cat {
  flex: 1;
  min-width: 160px;
}
.report-grid .bar-row > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 利润明细：桌面表格 / 移动卡片 */
.profit-list {
  display: none;
}
.profit-item {
  padding: 12px 0;
  border-bottom: 1px solid #eef1f3;
}
.profit-item:last-child {
  border-bottom: 0;
}
.profit-year {
  font-weight: 650;
  margin-bottom: 6px;
}
.profit-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #4c5664;
  padding: 3px 0;
}
.profit-row span {
  color: #8b96a5;
}
.empty-tip {
  text-align: center;
  color: #8b96a5;
  padding: 16px 0;
}

@media (max-width: 700px) {
  .profit-table-wrap {
    display: none;
  }
  .profit-list {
    display: block;
  }
}
</style>
