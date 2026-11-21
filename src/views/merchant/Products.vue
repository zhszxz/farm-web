<template>
  <div>
    <div class="page-head">
      <div>
        <h1>商品管理</h1>
        <p>管理您的农产品信息，让更多消费者发现好产品。</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" @click="openCreate">＋ 新增产品</button>
      </div>
    </div>

    <div class="filters">
      <div class="segmented">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="{ active: status === f.value }"
          @click="changeFilter(f.value)"
        >
          {{ f.label }}
        </button>
      </div>
      <input v-model="keyword" placeholder="搜索商品名称..." />
    </div>

    <div v-if="loading" class="card" style="text-align: center; color: #8b96a5">加载中…</div>
    <div v-else-if="!filtered.length" class="card" style="text-align: center; color: #8b96a5">
      暂无商品，点击右上角「新增产品」发布吧。
    </div>
    <div v-else class="products-grid">
      <article v-for="p in filtered" :key="p.id" class="card product-card">
        <div class="product-visual">
          <img v-if="firstImage(p.images)" :src="firstImage(p.images)" alt="" />
          <span v-else>{{ emoji(p) }}</span>
          <span class="status" :class="statusCls(p.status)">{{ statusText(p.status) }}</span>
        </div>
        <div class="product-info">
          <h3>{{ p.name }}</h3>
          <p>{{ categoryName(p.categoryId) }} · {{ p.origin || '产地待填' }}</p>
          <div class="product-meta">
            <span>{{ p.season ? seasonText(p.season) : '季节待填' }}</span>
            <span>{{ p.unit ? unitText(p.unit) : '' }}</span>
          </div>
          <div class="product-actions">
            <button class="btn small" @click="openEdit(p)">编辑</button>
            <button v-if="p.status !== 1" class="btn small soft" @click="setStatus(p, 1)">上架</button>
            <button v-else class="btn small" @click="setStatus(p, 2)">下架</button>
            <button class="btn small danger" @click="onDelete(p)">删除</button>
          </div>
        </div>
      </article>
    </div>

    <!-- 新增/编辑弹窗 -->
    <div v-if="modalVisible" class="modal-backdrop show" @click.self="modalVisible = false">
      <div class="modal">
        <div class="modal-head">
          <h3>{{ editing ? '编辑产品' : '新增产品' }}</h3>
          <button class="close" @click="modalVisible = false">×</button>
        </div>
        <div class="form-grid">
          <div class="form-field full">
            <label>产品名称 *</label>
            <input v-model="form.name" placeholder="如：红富士苹果 5斤装" maxlength="50" />
          </div>
          <div class="form-field">
            <label>大类</label>
            <select v-model="bigCatId" @change="onBigChange">
              <option :value="null">请选择</option>
              <option v-for="c in bigCats" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>小类（品种）</label>
            <select v-model="form.categoryId">
              <option :value="null">请选择</option>
              <option v-for="c in smallCats" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>计量单位</label>
            <select v-model="form.unit">
              <option value="">请选择</option>
              <option v-for="u in units" :key="u.dictValue" :value="u.dictValue">{{ u.dictLabel }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>上市季节</label>
            <select v-model="form.season">
              <option value="">请选择</option>
              <option v-for="s in seasons" :key="s.dictValue" :value="s.dictValue">{{ s.dictLabel }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>产地</label>
            <input v-model="form.origin" placeholder="如：陕西 · 渭南" />
          </div>
          <div class="form-field">
            <label>状态</label>
            <select v-model.number="form.status">
              <option :value="1">上架</option>
              <option :value="0">草稿</option>
              <option :value="2">下架</option>
            </select>
          </div>
          <div class="form-field full">
            <label>产品图片</label>
            <div style="display: flex; align-items: center; gap: 10px">
              <img v-if="imagePreview" :src="imagePreview" alt="" style="width: 64px; height: 64px; border-radius: 10px; object-fit: cover" />
              <label class="btn small" style="cursor: pointer">
                {{ uploading ? '上传中…' : '上传图片' }}
                <input type="file" accept="image/*" hidden @change="onFileChange" />
              </label>
            </div>
          </div>
          <div class="form-field full">
            <label>产品介绍</label>
            <textarea v-model="form.description" rows="3" placeholder="介绍产品特点、种植方式等"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="modalVisible = false">取消</button>
          <button class="btn primary" :disabled="saving" @click="save">{{ saving ? '保存中…' : '保存' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  listProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus
} from '../../api/modules/merchant'
import { getCategories, uploadFile } from '../../api/modules/product'
import { getDicts } from '../../api/modules/dict'
import { merchantToast } from '../../utils/merchantToast'
import { firstImage, categoryEmoji, seasonText, unitText } from '../../utils/format'

const filters = [
  { value: 'all', label: '全部商品' },
  { value: 1, label: '上架中' },
  { value: 2, label: '已下架' },
  { value: 0, label: '草稿' }
]
const status = ref('all')
const keyword = ref('')
const loading = ref(true)
const rows = ref([])
const categories = ref([])
const units = ref([])
const seasons = ref([])

const modalVisible = ref(false)
const saving = ref(false)
const uploading = ref(false)
const editing = ref(null)
const imagePreview = ref('')
const bigCatId = ref(null)
const form = ref({ name: '', categoryId: null, unit: '', season: '', origin: '', description: '', images: '', status: 1 })

const bigCats = computed(() => categories.value.filter((c) => c.level === 1))
const smallCats = computed(() =>
  categories.value.filter((c) => c.level === 2 && c.parentId === bigCatId.value)
)
const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return rows.value.filter((p) => {
    const matchStatus = status.value === 'all' || p.status === status.value
    const matchKeyword = !k || p.name.toLowerCase().includes(k)
    return matchStatus && matchKeyword
  })
})

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

async function load() {
  loading.value = true
  try {
    const [res, cats, unitDict, seasonDict] = await Promise.all([
      listProducts({ page: 1, size: 500 }),
      getCategories(),
      getDicts('unit'),
      getDicts('season')
    ])
    rows.value = (res && res.records) || []
    categories.value = cats || []
    units.value = unitDict || []
    seasons.value = seasonDict || []
  } catch (e) {
    merchantToast('加载失败')
  } finally {
    loading.value = false
  }
}

function changeFilter(v) {
  status.value = v
}

function openCreate() {
  editing.value = null
  form.value = { name: '', categoryId: null, unit: '', season: '', origin: '', description: '', images: '', status: 1 }
  bigCatId.value = null
  imagePreview.value = ''
  modalVisible.value = true
}

function openEdit(p) {
  editing.value = p
  const cat = categories.value.find((c) => c.id === p.categoryId)
  bigCatId.value = cat && cat.level === 2 ? cat.parentId : cat && cat.level === 1 ? cat.id : null
  form.value = {
    name: p.name,
    categoryId: p.categoryId,
    unit: p.unit || '',
    season: p.season || '',
    origin: p.origin || '',
    description: p.description || '',
    images: p.images || '',
    status: p.status
  }
  imagePreview.value = firstImage(p.images)
  modalVisible.value = true
}

function onBigChange() {
  form.value.categoryId = null
}

async function save() {
  if (!form.value.name) {
    merchantToast('请填写产品名称')
    return
  }
  saving.value = true
  try {
    if (editing.value) {
      await updateProduct(editing.value.id, form.value)
      merchantToast('已保存')
    } else {
      await addProduct(form.value)
      merchantToast('已新增')
    }
    modalVisible.value = false
    await load()
  } catch (e) {
    merchantToast('保存失败')
  } finally {
    saving.value = false
  }
}

async function setStatus(p, s) {
  try {
    await updateProductStatus(p.id, s)
    merchantToast(s === 1 ? '已上架' : '已下架')
    await load()
  } catch (e) {
    merchantToast('操作失败')
  }
}

async function onDelete(p) {
  // 简单二次确认
  if (!window.confirm(`确定删除「${p.name}」吗？`)) return
  try {
    await deleteProduct(p.id)
    merchantToast('已删除')
    await load()
  } catch (e) {
    merchantToast('删除失败')
  }
}

async function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (!/^image\//.test(file.type)) {
    merchantToast('请选择图片')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    merchantToast('图片不能超过 5MB')
    return
  }
  uploading.value = true
  try {
    const res = await uploadFile(file)
    const url = typeof res === 'string' ? res : res && res.url
    if (url) {
      imagePreview.value = url
      form.value.images = JSON.stringify([url])
      merchantToast('图片已上传')
    }
  } catch (e) {
    merchantToast('上传失败')
  } finally {
    uploading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.form-field textarea {
  resize: vertical;
  font-family: inherit;
}
</style>
