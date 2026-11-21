<template>
  <div class="detail">
    <van-nav-bar title="产品详情" left-arrow fixed placeholder @click-left="goBack" />

    <div v-if="loading" class="skeleton-box">
      <div class="sk hero-sk" />
      <div class="sk line" />
      <div class="sk line short" />
    </div>

    <EmptyState v-else-if="notFound" icon="🍂" text="产品不存在或已下架">
      <van-button type="primary" size="small" round @click="goHome">回到首页</van-button>
    </EmptyState>

    <EmptyState v-else-if="error" icon="⚠️" text="加载失败，请稍后重试">
      <van-button type="primary" size="small" round @click="load">重新加载</van-button>
    </EmptyState>

    <template v-else>
      <div class="gallery">
        <van-swipe v-if="images.length && !galleryError" class="swipe" :show-indicators="images.length > 1">
          <van-swipe-item v-for="(src, i) in images" :key="i">
            <img :src="src" alt="" loading="lazy" @error="galleryError = true" />
          </van-swipe-item>
        </van-swipe>
        <div v-else class="placeholder-img">
          <span class="emoji">{{ emoji }}</span>
          <span class="hint">暂无实拍图</span>
        </div>
      </div>

      <div class="info">
        <h1 class="name">{{ product.name }}</h1>
        <div class="tags">
          <span v-if="product.categoryName" class="tag orange">{{ product.categoryName }}</span>
          <span v-if="product.bigCategoryName" class="tag green">{{ product.bigCategoryName }}</span>
          <span v-if="product.season" class="tag gray">{{ seasonText(product.season) }}</span>
        </div>
        <div class="meta">
          <div class="meta-row">
            <span class="k">产地</span><span class="v">{{ product.origin || '待定' }}</span>
          </div>
          <div class="meta-row">
            <span class="k">规格</span>
            <span class="v">{{ product.unit ? unitText(product.unit) : '待定' }}</span>
          </div>
          <div class="meta-row">
            <span class="k">价格</span>
            <span class="v">{{
              product.price !== null && product.price !== undefined
                ? '¥' + formatMoney(product.price)
                : '价格以拼多多为准'
            }}</span>
          </div>
        </div>
        <div class="desc">{{ product.description || '暂无介绍' }}</div>
      </div>

      <div v-if="product.shop" class="shop-card" @click="goShop">
        <div class="shop-avatar">🧑‍🌾</div>
        <div class="shop-info">
          <div class="shop-name">{{ product.shop.shopName }}</div>
          <div class="shop-tip">进入商家主页 →</div>
        </div>
      </div>

      <div class="footer">
        <button class="btn-ghost" @click="onFavorite">{{ favorited ? '♥ 已收藏' : '♡ 收藏' }}</button>
        <button class="btn-buy" :disabled="buying" @click="onBuy">
          {{ buying ? '跳转中…' : '去拼多多购买' }}<span class="ext">↗</span>
        </button>
      </div>
      <p class="external-note">点击将跳转至拼多多，交易在拼多多完成。</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import EmptyState from '../components/EmptyState.vue'
import { getProductDetail, recordClick } from '../api/modules/product'
import { parseImages, seasonText, unitText, formatMoney, categoryEmoji } from '../utils/format'
import { useFavorite } from '../composables/useFavorite'

const route = useRoute()
const router = useRouter()
const { favorite } = useFavorite()

const product = ref({})
const loading = ref(true)
const error = ref(false)
const notFound = ref(false)
const favorited = ref(false)
const buying = ref(false)
const galleryError = ref(false)

const images = computed(() => parseImages(product.value.images))
const emoji = computed(() =>
  categoryEmoji(product.value.bigCategoryName || product.value.categoryName)
)

async function load() {
  loading.value = true
  error.value = false
  notFound.value = false
  galleryError.value = false
  try {
    product.value = await getProductDetail(route.params.id)
    setMeta()
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

function setMeta() {
  if (!product.value || !product.value.name) return
  document.title = `${product.value.name} · 农副产品平台`
  let meta = document.querySelector('meta[name="description"]')
  if (!meta) {
    meta = document.createElement('meta')
    meta.setAttribute('name', 'description')
    document.head.appendChild(meta)
  }
  meta.setAttribute(
    'content',
    `${product.value.name}，${product.value.origin || ''} ${
      product.value.description || ''
    }`.trim()
  )
}

async function onFavorite() {
  const ok = await favorite(1, product.value.id)
  if (ok) favorited.value = true
}

async function onBuy() {
  if (buying.value) return
  const link = product.value.shop && product.value.shop.linkUrl
  if (!link) {
    showToast('商家暂未配置拼多多链接')
    return
  }
  buying.value = true
  try {
    await recordClick({
      shopId: product.value.shop && product.value.shop.id,
      productId: product.value.id,
      source: 'detail'
    })
  } catch (e) {
    // 统计失败不阻塞跳转
  }
  const win = window.open(link, '_blank', 'noopener')
  if (!win) window.location.href = link
  buying.value = false
}

function goShop() {
  if (product.value.shop && product.value.shop.id) {
    router.push(`/shop/${product.value.shop.id}`)
  }
}
function goBack() {
  router.back()
}
function goHome() {
  router.push('/home')
}

onMounted(load)
</script>

<style scoped>
.detail {
  max-width: 1120px;
  margin: 0 auto;
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
.hero-sk {
  height: 260px;
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
.gallery {
  background: #f5f0e8;
}
.gallery img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
}
.placeholder-img {
  aspect-ratio: 4 / 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, #f7d9b8, #ea9c4e);
}
.placeholder-img .emoji {
  font-size: 90px;
  line-height: 1;
}
.placeholder-img .hint {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
}
.info {
  background: var(--surface);
  padding: 16px;
}
.name {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
}
.tags {
  display: flex;
  gap: 8px;
  margin: 10px 0;
}
.tag {
  font-size: 12px;
  padding: 5px 10px;
  border-radius: var(--r-pill);
}
.tag.orange {
  background: var(--orange-100);
  color: var(--orange-700);
}
.tag.green {
  background: var(--green-100);
  color: var(--green-700);
}
.tag.gray {
  background: #eef2ef;
  color: var(--text-2);
}
.meta {
  line-height: 1.9;
  font-size: 14px;
}
.meta-row {
  display: flex;
}
.meta-row .k {
  width: 44px;
  color: var(--text-3);
}
.meta-row .v {
  color: var(--text);
}
.desc {
  margin-top: 12px;
  font-size: 14px;
  color: var(--text-2);
  line-height: 1.7;
}
.shop-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--surface);
  margin: 12px;
  padding: 14px;
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
}
.shop-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b9e0c9, #22a06b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}
.shop-name {
  font-size: 15px;
  font-weight: 700;
}
.shop-tip {
  font-size: 12px;
  color: var(--text-3);
  margin-top: 2px;
}
.footer {
  display: flex;
  gap: 10px;
  padding: 10px 16px;
  background: #fff;
  border-top: 1px solid var(--line);
  position: sticky;
  bottom: 0;
}
.btn-ghost {
  width: 96px;
  height: 46px;
  border-radius: var(--r-pill);
  border: 1px solid var(--line);
  background: #fff;
  color: var(--text);
  font-size: 15px;
  cursor: pointer;
}
.btn-buy {
  flex: 1;
  height: 46px;
  border: 0;
  border-radius: var(--r-pill);
  background: var(--orange);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}
.btn-buy .ext {
  margin-left: 6px;
  font-size: 13px;
}
.btn-buy:disabled {
  opacity: 0.7;
}
.external-note {
  margin: 8px 16px 24px;
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
}

@media (min-width: 768px) {
  .detail {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0;
  }
  .gallery {
    width: 46%;
    border-radius: var(--r-xl);
    overflow: hidden;
    margin: 16px;
  }
  .placeholder-img,
  .gallery img {
    aspect-ratio: 1 / 1;
  }
  .info {
    flex: 1;
    min-width: 0;
    margin: 16px 16px 16px 0;
    border-radius: var(--r-xl);
    box-shadow: var(--shadow-sm);
  }
  .shop-card {
    width: calc(100% - 32px);
  }
  .footer {
    position: static;
    width: 100%;
    justify-content: flex-end;
    border-top: 0;
    background: transparent;
  }
  .btn-buy {
    flex: none;
    min-width: 220px;
  }
  .external-note {
    width: 100%;
  }
}
</style>
