<template>
  <div class="shop-home">
    <van-nav-bar title="商家主页" left-arrow fixed placeholder @click-left="goBack" />

    <div v-if="loading" class="skeleton-box">
      <div class="sk cover-sk" />
      <div class="sk line" />
      <div class="sk line short" />
    </div>

    <EmptyState v-else-if="notFound" icon="🏚️" text="店铺不存在或未通过审核">
      <van-button type="primary" size="small" round @click="goHome">回到首页</van-button>
    </EmptyState>

    <EmptyState v-else-if="error" icon="⚠️" text="加载失败，请稍后重试">
      <van-button type="primary" size="small" round @click="load">重新加载</van-button>
    </EmptyState>

    <template v-else>
      <div class="cover">🧑‍🌾</div>

      <div class="head">
        <div class="name">{{ shop.shopName }}</div>
        <div class="region">📍 {{ shop.region || '产地直供' }}</div>
        <div class="desc">{{ shop.description || '暂无介绍' }}</div>
      </div>

      <div
        v-if="shop.contactName || shop.contactPhone || shop.wechat"
        class="contact-card"
      >
        <div v-if="shop.contactName" class="row">
          <span class="k">联系人</span><span class="v">{{ shop.contactName }}</span>
        </div>
        <div v-if="shop.contactPhone" class="row">
          <span class="k">电话</span><span class="v">{{ shop.contactPhone }}</span>
          <button class="copy" @click="onCopy(shop.contactPhone)">复制</button>
        </div>
        <div v-if="shop.wechat" class="row">
          <span class="k">微信</span><span class="v">{{ shop.wechat }}</span>
          <button class="copy" @click="onCopy(shop.wechat)">复制</button>
        </div>
      </div>

      <button class="entry-btn" @click="onBuy">去拼多多店铺 <span>↗</span></button>

      <div class="section-head"><h2>农场产品</h2></div>

      <div v-if="loadingProducts" class="grid">
        <div v-for="i in 4" :key="i" class="sk card-sk" />
      </div>
      <EmptyState v-else-if="!products.length" icon="🌾" text="该商家暂无上架产品" />
      <div v-else class="grid">
        <ProductCard v-for="p in products" :key="p.id" :product="p" />
      </div>

      <div v-if="products.length" class="load-more">
        <button v-if="!finished" :disabled="loadingMore" @click="loadMore">
          {{ loadingMore ? '加载中…' : '加载更多' }}
        </button>
        <span v-else>没有更多了</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import ProductCard from '../components/ProductCard.vue'
import EmptyState from '../components/EmptyState.vue'
import { getShopHome, getShopProducts, recordClick } from '../api/modules/product'
import { copyText } from '../utils/format'

const route = useRoute()
const router = useRouter()

const shop = ref({})
const products = ref([])
const loading = ref(true)
const loadingProducts = ref(false)
const loadingMore = ref(false)
const notFound = ref(false)
const error = ref(false)
const page = ref(1)
const size = 10
const total = ref(0)
const finished = ref(false)

onMounted(load)

async function load() {
  loading.value = true
  error.value = false
  notFound.value = false
  try {
    shop.value = await getShopHome(route.params.id)
    document.title = `${shop.value.shopName || '商家主页'} · 农副产品平台`
    await fetchProducts(1, true)
  } catch (e) {
    if (e && e.code === 40400) {
      notFound.value = true
    } else {
      error.value = true
    }
  } finally {
    loading.value = false
  }
}

async function fetchProducts(p, reset) {
  if (reset) {
    loadingProducts.value = true
    products.value = []
    page.value = 1
    total.value = 0
    finished.value = false
  } else {
    loadingMore.value = true
  }
  try {
    const res = await getShopProducts(route.params.id, { page: p, size })
    const records = res.records || []
    if (reset) products.value = records
    else products.value = products.value.concat(records)
    total.value = res.total || 0
    page.value = p
    finished.value = products.value.length >= total.value || records.length < size
  } catch (e) {
    finished.value = true
  } finally {
    loadingProducts.value = false
    loadingMore.value = false
  }
}

function loadMore() {
  if (finished.value || loadingMore.value) return
  fetchProducts(page.value + 1, false)
}

async function onCopy(text) {
  const ok = await copyText(text)
  showToast(ok ? '已复制' : '复制失败')
}

async function onBuy() {
  const link = shop.value.linkUrl
  if (!link) {
    showToast('商家暂未配置拼多多链接')
    return
  }
  try {
    await recordClick({ shopId: shop.value.id, source: 'shop' })
  } catch (e) {
    // 统计失败不阻塞跳转
  }
  const win = window.open(link, '_blank', 'noopener')
  if (!win) window.location.href = link
}

function goBack() {
  router.back()
}
function goHome() {
  router.push('/home')
}
</script>

<style scoped>
.shop-home {
  max-width: 1120px;
  margin: 0 auto;
  padding-bottom: 20px;
}
.skeleton-box {
  padding: 16px;
}
.sk {
  background: linear-gradient(90deg, #eef2ef 25%, #e4ebe6 37%, #eef2ef 63%);
  background-size: 400% 100%;
  animation: sk 1.2s infinite;
  border-radius: var(--r-md);
}
.cover-sk {
  height: 200px;
  margin-bottom: 16px;
}
.line {
  height: 20px;
  margin-bottom: 10px;
}
.line.short {
  width: 50%;
}
@keyframes sk {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
.cover {
  height: 200px;
  background: linear-gradient(135deg, #f7d9b8, #ea9c4e);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 90px;
}
.head {
  background: var(--surface);
  padding: 16px;
}
.name {
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
}
.region {
  font-size: 13px;
  color: var(--text-3);
  margin-top: 6px;
}
.desc {
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.7;
  margin-top: 12px;
}
.contact-card {
  background: var(--surface);
  margin: 12px;
  border-radius: var(--r-lg);
  padding: 6px 16px;
  box-shadow: var(--shadow-sm);
}
.row {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.row:last-child {
  border-bottom: 0;
}
.k {
  width: 56px;
  font-size: 13px;
  color: var(--text-3);
}
.v {
  flex: 1;
  font-size: 14px;
  color: var(--text);
}
.copy {
  border: 0;
  background: transparent;
  color: var(--green);
  font-size: 12px;
  cursor: pointer;
}
.entry-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin: 0 12px;
  height: 46px;
  width: calc(100% - 24px);
  border: 0;
  border-radius: var(--r-pill);
  background: var(--orange);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}
.section-head {
  padding: 20px 12px 10px;
}
.section-head h2 {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: 700;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 12px;
}
.card-sk {
  height: 180px;
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
  .cover {
    height: 260px;
    font-size: 130px;
  }
  .grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    padding: 0 24px;
  }
  .contact-card {
    margin: 16px 24px;
  }
  .entry-btn {
    margin: 0 24px;
    width: calc(100% - 48px);
  }
  .section-head {
    padding: 24px 24px 12px;
  }
  .head {
    padding: 20px 24px;
  }
}
</style>
