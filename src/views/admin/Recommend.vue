<template>
  <div>
    <div class="heading">
      <div>
        <h1>推荐位管理</h1>
        <p>管理首页推荐产品，优化平台内容曝光。</p>
      </div>
      <button class="btn" @click="load">↻ 刷新</button>
    </div>

    <section class="panel">
      <div class="filter">
        <button class="tab" :class="{ active: recOnly }" @click="setRecOnly(true)">当前推荐</button>
        <button class="tab" :class="{ active: !recOnly }" @click="setRecOnly(false)">全部产品</button>
        <span class="spacer"></span>
        <input v-model="keyword" class="input" placeholder="搜索产品名称 / 店铺" />
        <span class="status neutral">推荐数 {{ recCount }} / 10</span>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>产品</th>
              <th>所属店铺</th>
              <th>分类</th>
              <th>产品状态</th>
              <th>推荐状态</th>
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
              <td>
                <button
                  class="toggle"
                  :class="{ on: p.isRecommend === 1 }"
                  :disabled="savingId === p.id"
                  @click="toggleRec(p)"
                ></button>
              </td>
              <td>
                <div class="actions">
                  <button class="text-btn" @click="openDetail(p)">详情</button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length"><td colspan="6" class="empty">暂无数据</td></tr>
          </tbody>
        </table>
      </div>

      <div class="foot">
        <span>共 {{ rows.length }} 条记录</span>
      </div>
    </section>

    <AdminModal v-model="detailVisible" title="产品详情">
      <div v-if="current">
        <p><b style="color: #1e293b">{{ current.name }}</b></p>
        <p>所属店铺：{{ shopName(current.shopId) }}</p>
        <p>分类：{{ categoryName(current.categoryId) }}</p>
        <p>产地：{{ current.origin || '-' }}</p>
        <p>推荐状态：{{ current.isRecommend === 1 ? '已推荐' : '未推荐' }}</p>
      </div>
      <template #footer><button class="btn" @click="detailVisible = false">关闭</button></template>
    </AdminModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  listProducts,
  setRecommend,
  listCategories,
  listShops
} from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'
import { firstImage } from '../../utils/format'
import AdminModal from '../../components/AdminModal.vue'

const allProducts = ref([])
const recOnly = ref(true)
const keyword = ref('')
const savingId = ref(null)
const catMap = ref({})
const shopMap = ref({})
const detailVisible = ref(false)
const current = ref(null)

const recCount = computed(() => allProducts.value.filter((p) => p.isRecommend === 1).length)

const rows = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return allProducts.value.filter((p) => {
    const matchRec = !recOnly.value || p.isRecommend === 1
    const matchKeyword =
      !k || p.name.toLowerCase().includes(k) || shopName(p.shopId).toLowerCase().includes(k)
    return matchRec && matchKeyword
  })
})

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

async function load() {
  try {
    const [products, cats, shops] = await Promise.all([
      listProducts({ page: 1, size: 500 }),
      listCategories(),
      listShops({ page: 1, size: 500 })
    ])
    allProducts.value = (products && products.records) || []
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
    adminToast('加载失败')
  }
}

function setRecOnly(v) {
  recOnly.value = v
}
function openDetail(p) {
  current.value = p
  detailVisible.value = true
}

async function toggleRec(p) {
  if (savingId.value) return
  const next = p.isRecommend === 1 ? 0 : 1
  savingId.value = p.id
  try {
    await setRecommend(p.id, next)
    p.isRecommend = next
    adminToast(next === 1 ? '已加入首页推荐' : '已取消推荐')
  } catch (e) {
    adminToast('操作失败')
  } finally {
    savingId.value = null
  }
}

onMounted(load)
</script>
