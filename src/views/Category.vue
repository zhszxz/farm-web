<template>
  <div class="category">
    <div class="cat-search">
      <van-search v-model="keyword" shape="round" placeholder="搜索农产品" @search="onSearch" />
    </div>

    <div class="cat-body">
      <aside class="cat-side">
        <button
          v-for="c in bigCategories"
          :key="c.id"
          class="side-item"
          :class="{ on: c.id === activeBig }"
          @click="selectBig(c.id)"
        >
          {{ c.name }}
        </button>
      </aside>

      <main class="cat-main">
        <div v-if="smallCategories.length" class="chips">
          <button class="chip" :class="{ on: !activeSmall }" @click="selectSmall(null)">全部</button>
          <button
            v-for="s in smallCategories"
            :key="s.id"
            class="chip"
            :class="{ on: s.id === activeSmall }"
            @click="selectSmall(s.id)"
          >
            {{ s.name }}
          </button>
        </div>

        <div v-if="loading" class="skeleton-grid">
          <div v-for="i in 4" :key="i" class="sk" />
        </div>

        <EmptyState v-else-if="error" icon="⚠️" text="加载失败，请稍后重试">
          <van-button type="primary" size="small" round @click="reload">重新加载</van-button>
        </EmptyState>

        <EmptyState
          v-else-if="!products.length"
          icon="🌾"
          :text="keyword ? '没有找到相关产品' : '该分类下暂无产品'"
        />

        <div v-else class="grid">
          <ProductCard
            v-for="p in products"
            :key="p.id"
            :product="p"
            :category-name="bigCategoryNameOf(p.categoryId)"
          />
        </div>

        <div v-if="products.length" class="load-more">
          <button v-if="!finished" :disabled="loadingMore" @click="loadMore">
            {{ loadingMore ? '加载中…' : '加载更多' }}
          </button>
          <span v-else>没有更多了</span>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getCategories, getProducts } from '../api/modules/product'

const route = useRoute()
const router = useRouter()

const categories = ref([])
const smallCategories = ref([])
const activeBig = ref(null)
const activeSmall = ref(null)
const products = ref([])
const page = ref(1)
const size = 10
const total = ref(0)
const loading = ref(true)
const loadingMore = ref(false)
const finished = ref(false)
const error = ref(false)
const keyword = ref('')

const bigCategories = computed(() => categories.value.filter((c) => c.level === 1))
const catMap = computed(() => {
  const m = {}
  categories.value.forEach((c) => (m[c.id] = c))
  return m
})

function bigCategoryNameOf(categoryId) {
  const c = catMap.value[categoryId]
  if (!c) return ''
  if (c.level === 1) return c.name
  const parent = catMap.value[c.parentId]
  return parent ? parent.name : c.name
}

onMounted(async () => {
  keyword.value = route.query.keyword || ''
  try {
    categories.value = (await getCategories()) || []
    const qBig = Number(route.query.bigCategoryId) || null
    const first = qBig || (bigCategories.value[0] && bigCategories.value[0].id)
    if (first) {
      selectBig(first)
    } else {
      await fetchPage(1, true)
    }
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
})

function selectBig(id) {
  activeBig.value = id
  activeSmall.value = null
  smallCategories.value = categories.value.filter((c) => c.level === 2 && c.parentId === id)
  reload()
}

function selectSmall(id) {
  activeSmall.value = id
  reload()
}

function reload() {
  fetchPage(1, true)
}

async function fetchPage(p, reset = false) {
  if (reset) {
    loading.value = true
    loadingMore.value = false
    products.value = []
    page.value = 1
    total.value = 0
    finished.value = false
    error.value = false
  } else {
    loadingMore.value = true
  }
  try {
    const params = { page: p, size }
    if (activeSmall.value) params.categoryId = activeSmall.value
    else if (activeBig.value) params.bigCategoryId = activeBig.value
    if (keyword.value) params.keyword = keyword.value
    const res = await getProducts(params)
    const records = res.records || []
    if (reset) products.value = records
    else products.value = products.value.concat(records)
    total.value = res.total || 0
    page.value = p
    finished.value = products.value.length >= total.value || records.length < size
  } catch (e) {
    error.value = true
    finished.value = true
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (finished.value || loadingMore.value) return
  fetchPage(page.value + 1)
}

function onSearch() {
  router.push({
    path: '/category',
    query: { ...route.query, keyword: keyword.value || undefined }
  })
  reload()
}
</script>

<style scoped>
.category {
  max-width: 1120px;
  margin: 0 auto;
}
.cat-search {
  padding: 4px 0;
}
.cat-search :deep(.van-search) {
  background: transparent;
}
.cat-body {
  display: flex;
  min-height: calc(100vh - 140px);
  background: var(--surface);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.cat-side {
  width: 88px;
  flex-shrink: 0;
  background: var(--surface-2);
  border-right: 1px solid var(--line);
}
.side-item {
  display: block;
  width: 100%;
  padding: 14px 8px;
  border: 0;
  background: transparent;
  font-size: 13px;
  color: var(--text-2);
  text-align: center;
  cursor: pointer;
}
.side-item.on {
  background: var(--surface);
  color: var(--green-700);
  font-weight: 700;
  box-shadow: inset 3px 0 0 var(--green);
}
.cat-main {
  flex: 1;
  min-width: 0;
  padding: 12px;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: var(--r-pill);
  cursor: pointer;
}
.chip.on {
  background: var(--green-100);
  border-color: var(--green);
  color: var(--green-700);
  font-weight: 600;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.sk {
  height: 180px;
  border-radius: var(--r-md);
  background: linear-gradient(90deg, #eef2ef 25%, #e4ebe6 37%, #eef2ef 63%);
  background-size: 400% 100%;
  animation: sk 1.2s infinite;
}
@keyframes sk {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
.load-more {
  padding: 18px 0 6px;
  text-align: center;
}
.load-more button {
  border: 1px solid var(--line);
  background: var(--surface);
  color: var(--text-2);
  font-size: 13px;
  padding: 10px 22px;
  border-radius: var(--r-pill);
  cursor: pointer;
}
.load-more button:disabled {
  opacity: 0.5;
}
.load-more span {
  font-size: 12px;
  color: var(--text-3);
}

@media (min-width: 768px) {
  .cat-side {
    width: 150px;
  }
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  .skeleton-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
