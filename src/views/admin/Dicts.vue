<template>
  <div>
    <div class="heading">
      <div>
        <h1>字典管理</h1>
        <p>维护平台分类、销售渠道、成本类型与通用字典。</p>
      </div>
      <button class="btn primary" @click="openCreate">＋ 新增字典项</button>
    </div>

    <section class="panel">
      <div class="tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="tab"
          :class="{ active: active === t.key }"
          @click="switchTab(t.key)"
        >
          {{ t.label }}
        </button>
      </div>
      <div class="filter">
        <span>共 {{ rows.length }} 项</span>
        <span class="spacer"></span>
        <button class="btn" @click="load">↻ 刷新</button>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th v-for="col in columns" :key="col">{{ col }}</th>
              <th>状态</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td v-for="(val, idx) in cellValues(row)" :key="idx">{{ val }}</td>
              <td>
                <span class="status" :class="row.status === 1 ? 'approved' : 'draft'">
                  {{ row.status === 1 ? '启用' : '停用' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="text-btn" @click="openEdit(row)">编辑</button>
                  <button class="text-btn red" @click="askDelete(row)">删除</button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td :colspan="columns.length + 2" class="empty">暂无数据</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminModal v-model="formVisible" :title="editing ? '编辑字典项' : '新增字典项'">
      <template v-if="active === 'categories'">
        <div class="admin-form-row">
          <label>分类名称</label>
          <input v-model="form.name" placeholder="如：苹果 / 红富士" />
        </div>
        <div class="admin-form-row">
          <label>父级分类（大类）</label>
          <select v-model="form.parentId">
            <option :value="0">无（作为大类）</option>
            <option v-for="c in bigCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>排序</label>
          <input v-model.number="form.sort" type="number" />
        </div>
      </template>

      <template v-else-if="active === 'channels' || active === 'costs'">
        <div class="admin-form-row">
          <label>名称</label>
          <input v-model="form.name" />
        </div>
        <div class="admin-form-row">
          <label>排序</label>
          <input v-model.number="form.sort" type="number" />
        </div>
      </template>

      <template v-else>
        <div class="admin-form-row">
          <label>字典类型</label>
          <select v-model="form.dictType">
            <option v-for="t in dictTypes" :key="t.code" :value="t.code">
              {{ t.code }}（{{ t.label }}）
            </option>
          </select>
        </div>
        <div class="admin-form-row">
          <label>显示名称</label>
          <input v-model="form.dictLabel" placeholder="如：斤 / 春季" />
        </div>
        <div class="admin-form-row">
          <label>字典值</label>
          <input v-model="form.dictValue" placeholder="如：jin / spring" />
        </div>
        <div class="admin-form-row">
          <label>排序</label>
          <input v-model.number="form.sort" type="number" />
        </div>
      </template>

      <template #footer>
        <button class="btn" @click="formVisible = false">取消</button>
        <button class="btn primary" @click="save">保存</button>
      </template>
    </AdminModal>

    <AdminModal v-model="deleteVisible" title="删除字典项">
      <p>确定要删除「{{ deleting && (deleting.name || deleting.dictLabel) }}」吗？删除后不可恢复。</p>
      <template #footer>
        <button class="btn" @click="deleteVisible = false">取消</button>
        <button class="btn danger" @click="confirmDelete">确认删除</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listChannels,
  createChannel,
  updateChannel,
  deleteChannel,
  listCostTypes,
  createCostType,
  updateCostType,
  deleteCostType,
  listDicts,
  listDictTypes,
  createDict,
  updateDict,
  deleteDict
} from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'
import AdminModal from '../../components/AdminModal.vue'

const tabs = [
  { key: 'categories', label: '产品分类' },
  { key: 'channels', label: '销售渠道' },
  { key: 'costs', label: '成本类型' },
  { key: 'general', label: '通用字典' }
]
const active = ref('categories')
const rows = ref([])
const allCategories = ref([])
const dictTypes = ref([])
const formVisible = ref(false)
const deleteVisible = ref(false)
const editing = ref(null)
const deleting = ref(null)
const form = ref({})

const bigCategories = computed(() => allCategories.value.filter((c) => c.level === 1))

const columns = computed(() => {
  if (active.value === 'categories') return ['名称', '父级', '层级', '排序']
  if (active.value === 'channels') return ['渠道名称', '排序']
  if (active.value === 'costs') return ['成本类型', '排序']
  return ['字典类型', '显示名称', '值', '排序']
})

function cellValues(row) {
  if (active.value === 'categories') {
    return [row.name, parentName(row.parentId), row.level === 1 ? '大类' : '小类', row.sort]
  }
  if (active.value === 'channels') return [row.name, row.sort]
  if (active.value === 'costs') return [row.name, row.sort]
  return [row.dictType, row.dictLabel, row.dictValue, row.sort]
}

function parentName(pid) {
  if (!pid) return '—'
  const p = allCategories.value.find((c) => c.id === pid)
  return p ? p.name : pid
}

async function load() {
  try {
    if (active.value === 'categories') {
      allCategories.value = await listCategories()
      rows.value = allCategories.value
    } else if (active.value === 'channels') {
      rows.value = await listChannels()
    } else if (active.value === 'costs') {
      rows.value = await listCostTypes()
    } else {
      rows.value = await listDicts()
    }
  } catch (e) {
    adminToast('加载失败')
  }
}

function switchTab(k) {
  active.value = k
  load()
}

function openCreate() {
  editing.value = null
  form.value = {
    name: '',
    parentId: 0,
    sort: 0,
    dictType: 'unit',
    dictLabel: '',
    dictValue: ''
  }
  formVisible.value = true
}

function openEdit(row) {
  editing.value = row
  form.value = { ...row }
  formVisible.value = true
}

async function save() {
  try {
    if (active.value === 'categories') {
      const payload = {
        name: form.value.name,
        parentId: form.value.parentId || 0,
        level: form.value.parentId ? 2 : 1,
        sort: form.value.sort || 0
      }
      if (editing.value) await updateCategory(editing.value.id, payload)
      else await createCategory(payload)
    } else if (active.value === 'channels') {
      const payload = { name: form.value.name, sort: form.value.sort || 0 }
      if (editing.value) await updateChannel(editing.value.id, payload)
      else await createChannel(payload)
    } else if (active.value === 'costs') {
      const payload = { name: form.value.name, sort: form.value.sort || 0 }
      if (editing.value) await updateCostType(editing.value.id, payload)
      else await createCostType(payload)
    } else {
      const payload = {
        dictType: form.value.dictType,
        dictLabel: form.value.dictLabel,
        dictValue: form.value.dictValue,
        sort: form.value.sort || 0
      }
      if (editing.value) await updateDict(editing.value.id, payload)
      else await createDict(payload)
    }
    adminToast(editing.value ? '已保存' : '已新增')
    formVisible.value = false
    await load()
  } catch (e) {
    adminToast('保存失败')
  }
}

function askDelete(row) {
  deleting.value = row
  deleteVisible.value = true
}

async function confirmDelete() {
  try {
    if (active.value === 'categories') await deleteCategory(deleting.value.id)
    else if (active.value === 'channels') await deleteChannel(deleting.value.id)
    else if (active.value === 'costs') await deleteCostType(deleting.value.id)
    else await deleteDict(deleting.value.id)
    adminToast('已删除')
    deleteVisible.value = false
    await load()
  } catch (e) {
    adminToast('删除失败，可能已被引用')
  }
}

onMounted(async () => {
  try {
    allCategories.value = await listCategories()
  } catch (e) {
    // 忽略
  }
  try {
    dictTypes.value = await listDictTypes()
  } catch (e) {
    // 忽略：类型列表失败时下拉为空
  }
  load()
})
</script>
