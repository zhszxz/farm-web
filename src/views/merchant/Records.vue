<template>
  <div>
    <div class="page-head">
      <div>
        <h1>经营记录</h1>
        <p>销售、产量和成本记录统一管理，随时掌握经营数据。</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" @click="openCreate">＋ 新增记录</button>
      </div>
    </div>

    <div class="segmented record-tabs">
      <button
        v-for="t in types"
        :key="t.value"
        :class="{ active: recordType === t.value }"
        @click="switchType(t.value)"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="filters">
      <select v-model.number="year">
        <option v-for="y in yearOptions" :key="y" :value="y">{{ y }} 年</option>
      </select>
      <VarietySelect
        v-model="categoryId"
        :label="categoryId ? categoryName(categoryId) : ''"
        placeholder="全部品种"
        allow-clear
      />
      <select v-if="recordType === 'sales'" v-model="extraId">
        <option value="">全部渠道</option>
        <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-if="recordType === 'costs'" v-model="extraId">
        <option value="">全部成本类型</option>
        <option v-for="c in costTypes" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <button class="btn" @click="load">⌕ 筛选</button>
      <button v-if="recordType === 'sales'" class="btn" @click="onImport">⇧ Excel 导入</button>
    </div>

    <div class="card record-table">
      <table class="table">
        <thead>
          <tr>
            <th v-for="c in columns" :key="c">{{ c }}</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in rows" :key="r.id">
            <td>{{ r.year }}</td>
            <td>{{ categoryName(r.categoryId) }}</td>
            <template v-if="recordType === 'sales'">
              <td>{{ channelName(r.channelId) }}</td>
              <td>{{ formatMoney(r.quantity) }}</td>
              <td>{{ unitText(r.unit) }}</td>
              <td>¥ {{ formatMoney(r.amount) }}</td>
              <td>{{ r.salePeriod || '-' }}</td>
            </template>
            <template v-else-if="recordType === 'productions'">
              <td>{{ r.area != null ? formatMoney(r.area) + ' 亩' : '-' }}</td>
              <td>{{ formatMoney(r.quantity) }}</td>
              <td>{{ unitText(r.unit) }}</td>
              <td>{{ r.remark || '-' }}</td>
            </template>
            <template v-else>
              <td>{{ costTypeName(r.costTypeId) }}</td>
              <td>¥ {{ formatMoney(r.amount) }}</td>
              <td>{{ r.remark || '-' }}</td>
            </template>
            <td>
              <button class="btn small" @click="openEdit(r)">编辑</button>
              <button class="btn small danger" @click="onDelete(r)">删除</button>
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td :colspan="columns.length + 1" style="text-align: center; color: #8b96a5">暂无记录</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="modalVisible" class="modal-backdrop show" @click.self="modalVisible = false">
      <div class="modal">
        <div class="modal-head">
          <h3>{{ editing ? '编辑' : '新增' }}{{ typeLabel }}</h3>
          <button class="close" @click="modalVisible = false">×</button>
        </div>
        <div class="form-grid">
          <div class="form-field">
            <label>年份</label>
            <select v-model.number="form.year">
              <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>品种</label>
            <VarietySelect
              v-model="form.categoryId"
              :label="form.categoryId ? categoryName(form.categoryId) : ''"
              placeholder="请选择品种"
            />
          </div>

          <template v-if="recordType === 'sales'">
            <div class="form-field">
              <label>渠道</label>
              <select v-model="form.channelId">
                <option :value="null">请选择</option>
                <option v-for="c in channels" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>数量</label>
              <input v-model="form.quantity" type="number" placeholder="如 800" />
            </div>
            <div class="form-field">
              <label>单位</label>
              <select v-model="form.unit">
                <option value="">请选择</option>
                <option v-for="u in units" :key="u.dictValue" :value="u.dictValue">{{ u.dictLabel }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>销售额（元）</label>
              <input v-model="form.amount" type="number" placeholder="如 4800" />
            </div>
            <div class="form-field">
              <label>时间段</label>
              <input v-model="form.salePeriod" placeholder="如 2026年10月" />
            </div>
            <div class="form-field">
              <label>单价（元/单位）</label>
              <input :value="computedUnitPrice" readonly placeholder="自动计算" />
            </div>
          </template>

          <template v-else-if="recordType === 'productions'">
            <div class="form-field">
              <label>种植面积（亩）</label>
              <input v-model="form.area" type="number" placeholder="选填" />
            </div>
            <div class="form-field">
              <label>产量</label>
              <input v-model="form.quantity" type="number" placeholder="如 4800" />
            </div>
            <div class="form-field">
              <label>单位</label>
              <select v-model="form.unit">
                <option value="">请选择</option>
                <option v-for="u in units" :key="u.dictValue" :value="u.dictValue">{{ u.dictLabel }}</option>
              </select>
            </div>
          </template>

          <template v-else>
            <div class="form-field">
              <label>成本类型</label>
              <select v-model="form.costTypeId">
                <option :value="null">请选择</option>
                <option v-for="c in costTypes" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-field">
              <label>金额（元）</label>
              <input v-model="form.amount" type="number" placeholder="如 3200" />
            </div>
          </template>

          <div class="form-field full">
            <label>备注</label>
            <input v-model="form.remark" placeholder="选填，补充说明" />
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="modalVisible = false">取消</button>
          <button class="btn primary" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存记录' }}</button>
        </div>
      </div>
    </div>

    <input ref="fileInput" type="file" accept=".xlsx" hidden @change="onImportFile" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  listSales,
  addSale,
  updateSale,
  deleteSale,
  importSales,
  listProductions,
  addProduction,
  updateProduction,
  deleteProduction,
  listCosts,
  addCost,
  updateCost,
  deleteCost
} from '../../api/modules/merchant'
import { getCategories } from '../../api/modules/product'
import { getChannels, getCostTypes, getDicts } from '../../api/modules/dict'
import VarietySelect from '../../components/VarietySelect.vue'
import { merchantToast } from '../../utils/merchantToast'
import { formatMoney, unitText } from '../../utils/format'

const types = [
  { value: 'sales', label: '销售记录' },
  { value: 'productions', label: '产量记录' },
  { value: 'costs', label: '成本记录' }
]
const recordType = ref('sales')
const typeLabel = computed(() => ({ sales: '销售记录', productions: '产量记录', costs: '成本记录' }[recordType.value]))

const year = ref(new Date().getFullYear())
const yearOptions = [2026, 2025, 2024, 2023]
const categoryId = ref('')
const extraId = ref('')
const rows = ref([])
const categories = ref([])
const channels = ref([])
const costTypes = ref([])
const units = ref([])

const modalVisible = ref(false)
const saving = ref(false)
const editing = ref(null)
const form = ref({})
const fileInput = ref(null)

// 单价 = 销售额 / 数量（只读展示，保存时由后端计算）
const computedUnitPrice = computed(() => {
  const q = Number(form.value.quantity)
  const a = Number(form.value.amount)
  if (!q || !a || q <= 0) return ''
  return (a / q).toFixed(2)
})
const catMap = computed(() => {
  const m = {}
  categories.value.forEach((c) => {
    m[c.id] = c.name
  })
  return m
})
const channelMap = computed(() => {
  const m = {}
  channels.value.forEach((c) => {
    m[c.id] = c.name
  })
  return m
})
const costTypeMap = computed(() => {
  const m = {}
  costTypes.value.forEach((c) => {
    m[c.id] = c.name
  })
  return m
})

function categoryName(id) {
  return catMap.value[id] || '-'
}
function channelName(id) {
  return channelMap.value[id] || '-'
}
function costTypeName(id) {
  return costTypeMap.value[id] || '-'
}

const columns = computed(() => {
  if (recordType.value === 'sales') {
    return ['年份', '品种', '渠道', '数量', '单位', '销售额', '时间段']
  }
  if (recordType.value === 'productions') {
    return ['年份', '品种', '种植面积', '产量', '单位', '备注']
  }
  return ['年份', '品种', '成本类型', '金额', '备注']
})

async function load() {
  const params = { page: 1, size: 500, year: year.value }
  if (categoryId.value) params.categoryId = categoryId.value
  if (recordType.value === 'sales' && extraId.value) params.channelId = extraId.value
  if (recordType.value === 'costs' && extraId.value) params.costTypeId = extraId.value
  try {
    let res
    if (recordType.value === 'sales') res = await listSales(params)
    else if (recordType.value === 'productions') res = await listProductions(params)
    else res = await listCosts(params)
    rows.value = (res && res.records) || []
  } catch (e) {
    merchantToast('加载失败')
  }
}

function switchType(t) {
  recordType.value = t
  extraId.value = ''
  load()
}

function openCreate() {
  editing.value = null
  if (recordType.value === 'sales') {
    form.value = { year: year.value, categoryId: null, channelId: null, quantity: '', unit: '', amount: '', unitPrice: '', salePeriod: '', remark: '' }
  } else if (recordType.value === 'productions') {
    form.value = { year: year.value, categoryId: null, area: '', quantity: '', unit: '', remark: '' }
  } else {
    form.value = { year: year.value, categoryId: null, costTypeId: null, amount: '', remark: '' }
  }
  modalVisible.value = true
}

function openEdit(r) {
  editing.value = r
  form.value = { ...r }
  modalVisible.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {}
    Object.keys(form.value).forEach((k) => {
      payload[k] = form.value[k]
    })
    // 清理空字符串为 null
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') payload[k] = null
    })
    // 单价统一由后端按「销售额 / 数量」计算，避免前端传错值
    if (recordType.value === 'sales') {
      payload.unitPrice = null
    }
    if (recordType.value === 'sales') {
      if (editing.value) await updateSale(editing.value.id, payload)
      else await addSale(payload)
    } else if (recordType.value === 'productions') {
      if (editing.value) await updateProduction(editing.value.id, payload)
      else await addProduction(payload)
    } else {
      if (editing.value) await updateCost(editing.value.id, payload)
      else await addCost(payload)
    }
    merchantToast('已保存')
    modalVisible.value = false
    await load()
  } catch (e) {
    merchantToast('保存失败')
  } finally {
    saving.value = false
  }
}

async function onDelete(r) {
  if (!window.confirm('确定删除该记录吗？')) return
  try {
    if (recordType.value === 'sales') await deleteSale(r.id)
    else if (recordType.value === 'productions') await deleteProduction(r.id)
    else await deleteCost(r.id)
    merchantToast('已删除')
    await load()
  } catch (e) {
    merchantToast('删除失败')
  }
}

function onImport() {
  if (fileInput.value) fileInput.value.click()
}

async function onImportFile(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  try {
    const count = await importSales(file)
    merchantToast(`成功导入 ${typeof count === 'number' ? count : 0} 条`)
    await load()
  } catch (err) {
    merchantToast('导入失败')
  } finally {
    e.target.value = ''
  }
}

onMounted(async () => {
  try {
    const [cats, ch, ct, u] = await Promise.all([
      getCategories(),
      getChannels(),
      getCostTypes(),
      getDicts('unit')
    ])
    categories.value = cats || []
    channels.value = ch || []
    costTypes.value = ct || []
    units.value = u || []
  } catch (e) {
    // 忽略
  }
  load()
})
</script>
