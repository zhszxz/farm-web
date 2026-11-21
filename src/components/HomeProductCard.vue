<template>
  <article class="hp-card" @click="goDetail">
    <div class="thumb">
      <ProductImage :images="product.images" :emoji="emoji" ratio="4-3" />
      <span v-if="tag" class="badge">{{ tag }}</span>
    </div>
    <div class="body">
      <h3 class="name">{{ product.name }}</h3>
      <div class="foot">
        <span class="origin">📍 {{ product.origin || '产地直供' }}</span>
        <button class="view" @click.stop="goDetail">立即查看</button>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import ProductImage from './ProductImage.vue'
import { categoryEmoji } from '../utils/format'

const props = defineProps({
  product: { type: Object, required: true },
  tag: { type: String, default: '' },
  categoryName: { type: String, default: '' }
})

const router = useRouter()
const emoji = computed(() => categoryEmoji(props.categoryName || props.product.categoryName || ''))

function goDetail() {
  router.push(`/product/${props.product.id}`)
}
</script>

<style scoped>
.hp-card {
  background: var(--surface);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}
.hp-card:hover {
  box-shadow: var(--shadow);
}
.thumb {
  position: relative;
}
.badge {
  position: absolute;
  top: 10px;
  left: 10px;
  background: var(--green);
  color: #fff;
  font-size: 11px;
  line-height: 1;
  padding: 5px 10px;
  border-radius: var(--r-pill);
}
.body {
  padding: 10px 12px 12px;
}
.name {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 8px;
}
.origin {
  font-size: 12px;
  color: var(--text-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.view {
  flex: none;
  border: 0;
  background: var(--green);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: var(--r-pill);
  cursor: pointer;
  font-family: inherit;
}
</style>
