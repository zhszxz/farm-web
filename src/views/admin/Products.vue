<template>
  <div>
    <div class="heading">
      <div>
        <h1>产品内容审核</h1>
        <p>审核和管理平台展示的农副产品内容。</p>
      </div>
      <button class="btn" @click="load">↻ 刷新</button>
    </div>

    <section class="panel">
      <div class="filter">
        <label>产品状态</label>
        <button
          v-for="t in tabs"
          :key="t.value"
          class="tab"
          :class="{ active: status === t.value }"
          @click="changeStatus(t.value)"
        >
          {{ t.label }}
        </button>
        <span class="spacer"></span>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>产品信息</th>
              <th>所属店铺</th>
              <th>分类</th>
              <th>状态</th>
              <th>推荐</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in rows" :key="p.id">
              <td>
                <div class="product">
                  <span class="thumb">
                    <img v-if="firstImage(p.images)" :src="firstImage(p.images)" alt="" />
                    <span v-else>🌿</span>
                  </span>
                  {{ p.name }}
                </div>
              </td>
              <td>{{ shopName(p.shopId) }}</td>
              <td style="color: #94a3b8">{{ categoryName(p.categoryId) }}</td>
              <td><span class="status" :class="statusCls(p.status)">{{ statusLabel(p.status) }}</span></td>
              <td>{{ p.isRecommend === 1 ? '已推荐' : '—' }}</td>
              <td>
                <div class="actions">
                  <button class="text-btn" @click="openDetail(p)">详情</button>
                  <button v-if="p.status === 1" class="text-btn red" @click="setStatus(p, 2)">下架</button>
                  <button v-else class="text-btn" @click="setStatus(p, 1)">上架</button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length"><td colspan="6" class="empty">暂无数据</td></tr>
          </tbody>
        </table>
      </div>

      <div class="foot">
        <span>共 {{ total }} 条记录</span>
        <AdminPager :page="page" :total="total" :size="size" @change="onPage" />
      </div>
    </section>

    <AdminModal v-model="detailVisible" title="产品详情">
      <div v-if="current">
        <p><b style="color: #1e293b">{{ current.name }}</b></p>
        <p>所属店铺：{{ shopName(current.shopId) }}</p>
        <p>分类：{{ categoryName(current.categoryId) }}</p>
        <p>产地：{{ current.origin || '-' }}</p>
        <p>介绍：{{ current.description || '-' }}</p>
        <p>状态：{{ statusLabel(current.status) }} ｜ 推荐：{{ current.isRecommend === 1 ? '是' : '否' }}</p>
      </div>
      <template #footer><button class="btn" @click="detailVisible = false">关闭</button></template>
    </AdminModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  listProducts,
  updateProductStatus,
  listCategories,
  listShops
} from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'
import { firstImage } from '../../utils/format'
import AdminModal from '../../components/AdminModal.vue'
import AdminPager from '../../components/AdminPager.vue'

const tabs = [
  { value: 'all', label: '全部' },
  { value: 1, label: '上架' },
  { value: 2, label: '下架' },
  { value: 0, label: '草稿' }
]
const status = ref('all')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const size = 10
const catMap = ref({})
const shopMap = ref({})
const detailVisible = ref(false)
const current = ref(null)

function statusLabel(s) {
  return { 0: '草稿', 1: '上架中', 2: '已下架' }[s] || '-'
}
function statusCls(s) {
  return s === 0 ? 'draft' : s === 1 ? 'online' : 'offline'
}
function categoryName(id) {
  return catMap.value[id] || '-'
}
function shopName(id) {
  return shopMap.value[id] || '-'
}

async function loadMeta() {
  try {
    const [cats, shops] = await Promise.all([
      listCategories(),
      listShops({ page: 1, size: 500 })
    ])
    const cm = {}
    ;(cats || []).forEach((c) => {
      cm[c.id] = c.name
    })
    catMap.value = cm
    const sm = {}
    ;(shops && shops.records ? shops.records : []).forEach((s) => {
      sm[s.id] = s.shopName
    })
    shopMap.value = sm
  } catch (e) {
    // 忽略：名称解析失败时显示 -
  }
}

async function load() {
  const params = { page: page.value, size }
  if (status.value !== 'all') params.status = status.value
  try {
    const res = await listProducts(params)
    rows.value = res.records || []
    total.value = res.total || 0
  } catch (e) {
    adminToast('加载失败')
  }
}

function changeStatus(v) {
  status.value = v
  page.value = 1
  load()
}
function onPage(p) {
  page.value = p
  load()
}
function openDetail(p) {
  current.value = p
  detailVisible.value = true
}

async function setStatus(p, s) {
  try {
    await updateProductStatus(p.id, s)
    adminToast(s === 1 ? '已恢复上架' : '已下架')
    load()
  } catch (e) {
    adminToast('操作失败')
  }
}

onMounted(async () => {
  await loadMeta()
  load()
})
</script>
