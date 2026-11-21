<template>
  <article class="product-card" @click="goDetail">
    <div class="img-wrap">
      <ProductImage :images="product.images" :emoji="emoji" ratio="square" />
      <button class="fav-btn" :class="{ on: favorited }" aria-label="收藏" @click.stop="onFavorite">
        {{ favorited ? '♥' : '♡' }}
      </button>
    </div>
    <div class="body">
      <h3 class="name">{{ product.name }}</h3>
      <div class="meta">
        <span v-if="product.origin">{{ product.origin }}</span>
        <span v-if="product.season">· {{ seasonText(product.season) }}</span>
      </div>
      <div class="price">
        <template v-if="product.price !== null && product.price !== undefined">
          <span class="amount">¥{{ formatMoney(product.price) }}</span>
          <span class="unit">/{{ unitText(product.unit) }}</span>
        </template>
        <span v-else class="price-hint">价格以拼多多为准</span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductImage from './ProductImage.vue'
import { categoryEmoji, seasonText, unitText, formatMoney } from '../utils/format'
import { useFavorite } from '../composables/useFavorite'

const props = defineProps({
  product: { type: Object, required: true },
  categoryName: { type: String, default: '' }
})

const router = useRouter()
const { favorite } = useFavorite()
const favorited = ref(false)
const emoji = computed(() => categoryEmoji(props.categoryName))

function goDetail() {
  router.push(`/product/${props.product.id}`)
}

async function onFavorite() {
  const ok = await favorite(1, props.product.id)
  if (ok) favorited.value = true
}
</script>

<style scoped>
.product-card {
  background: var(--surface);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}
.product-card:hover {
  box-shadow: var(--shadow);
}
.product-card:active {
  transform: scale(0.985);
}
.img-wrap {
  position: relative;
}
.fav-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-3);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
}
.fav-btn.on {
  color: var(--danger);
}
.body {
  padding: 10px 12px 12px;
}
.name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.price {
  margin-top: 8px;
  font-family: inherit;
  font-variant-numeric: tabular-nums;
}
.amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--price);
}
.unit {
  font-size: 12px;
  color: var(--text-3);
}
.price-hint {
  font-size: 12px;
  color: var(--text-3);
}
</style>
