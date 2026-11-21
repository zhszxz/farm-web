<template>
  <div class="app-shell">
    <!-- 状态栏（原型装饰，可按需移除） -->
    <div class="status-bar" aria-label="状态栏">
      <span>9:41</span>
      <span class="status-icons">▮▮▮ ◉ ▰</span>
    </div>

    <!-- 品牌头 -->
    <header class="brand-row">
      <div class="brand">
        <div class="brand-logo" aria-hidden="true"><i></i></div>
        <div>
          <strong>清新果园</strong>
          <small>源自自然 · 健康美味</small>
        </div>
      </div>
      <button class="region-button" @click="onRegion">
        <span class="map-pin"></span>全国 <span class="chevron">⌄</span>
      </button>
    </header>

    <!-- 搜索 -->
    <label class="search-box">
      <span class="search-icon" aria-hidden="true"></span>
      <input
        v-model="keyword"
        type="search"
        placeholder="搜索你想要的农产品..."
        autocomplete="off"
      />
      <button v-if="keyword" class="clear-search" aria-label="清空搜索" @click="keyword = ''">
        ×
      </button>
    </label>

    <!-- Hero -->
    <section class="hero" aria-label="果园推荐">
      <img src="/images/hero.jpg" alt="果园和篮装苹果" />
    </section>

    <!-- 分类 -->
    <section class="category-strip" aria-label="产品分类">
      <button
        v-for="c in categories"
        :key="c.key"
        class="category"
        :class="{ selected: selectedCategory === c.key }"
        @click="toggleCategory(c.key)"
      >
        <span class="category-art" :class="c.art">{{ c.emoji }}</span>
        <span>{{ c.label }}</span>
      </button>
    </section>

    <!-- 为你推荐 -->
    <section class="recommend-section">
      <div class="section-heading">
        <h2><span class="leaf-mark">❧</span>为你推荐</h2>
        <button class="more-button" @click="onMore">查看更多 <span>›</span></button>
      </div>

      <div class="product-grid">
        <article v-for="p in visibleProducts" :key="p.name" class="product-card">
          <button class="product-open" :aria-label="`查看${p.name}详情`" @click="openDialog(p)">
            <div class="product-photo"><img :src="p.image" :alt="p.name" /></div>
            <div class="product-content">
              <h3>{{ p.name }}</h3>
              <p class="origin">{{ p.origin }}</p>
              <div class="product-footer">
                <span class="product-description">{{ p.description }}</span>
                <span class="view-pill">立即查看</span>
              </div>
            </div>
          </button>
        </article>
      </div>

      <p v-if="!visibleProducts.length" class="empty-state">
        没有找到相关农产品，试试其他关键词吧。
      </p>
    </section>
  </div>

  <!-- 详情弹窗 -->
  <transition name="fade">
    <div v-if="activeProduct" class="dialog-overlay" @click.self="closeDialog">
      <div class="product-dialog">
        <button class="dialog-close" aria-label="关闭" @click="closeDialog">×</button>
        <img :src="activeProduct.image" :alt="activeProduct.name" />
        <div class="dialog-body">
          <span class="dialog-tag">农产品展示</span>
          <h2>{{ activeProduct.name }}</h2>
          <p class="dialog-origin">{{ activeProduct.origin }}</p>
          <p>{{ activeProduct.desc }}</p>
          <button class="dialog-action" @click="onDialogAction">了解产品</button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

const router = useRouter()

const categories = [
  { key: '水果', label: '时令水果', emoji: '🍎', art: 'art-fruit' },
  { key: '蔬菜', label: '蔬菜鲜货', emoji: '🥬', art: 'art-vegetable' },
  { key: '粮油', label: '粮油杂粮', emoji: '🌾', art: 'art-grain' },
  { key: '坚果', label: '坚果干果', emoji: '🌰', art: 'art-nut' },
  { key: '特产', label: '农家特产', emoji: '🏡', art: 'art-special' }
]

const products = [
  {
    name: '云南高原红富士苹果',
    category: '水果',
    origin: '云南 · 昭通',
    desc: '高原果园自然生长，果香浓郁，脆甜多汁。',
    description: '高原种植 · 自然成熟',
    image: '/images/apples.jpg'
  },
  {
    name: '赣南脐橙',
    category: '水果',
    origin: '江西 · 赣州',
    desc: '果园新鲜采摘，橙香清新，汁水饱满。',
    description: '果园采摘 · 清甜多汁',
    image: '/images/oranges.jpg'
  },
  {
    name: '新鲜上海青',
    category: '蔬菜',
    origin: '江苏 · 南通',
    desc: '清晨采摘，鲜嫩爽口，适合家常烹饪。',
    description: '清晨采摘 · 鲜嫩爽口',
    image: '/images/greens.jpg'
  },
  {
    name: '沙地红薯',
    category: '特产',
    origin: '山东 · 临沂',
    desc: '沙地种植，口感香甜软糯，适合蒸煮烘烤。',
    description: '沙地种植 · 香甜软糯',
    image: '/images/sweetpotato.jpg'
  }
]

const keyword = ref('')
const selectedCategory = ref('')
const activeProduct = ref(null)

const visibleProducts = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  return products.filter((p) => {
    const matchKeyword =
      !k || p.name.toLowerCase().includes(k) || p.category.toLowerCase().includes(k)
    const matchCategory = !selectedCategory.value || p.category === selectedCategory.value
    return matchKeyword && matchCategory
  })
})

function toggleCategory(key) {
  if (selectedCategory.value === key) {
    selectedCategory.value = ''
    showToast('已显示全部推荐')
  } else {
    selectedCategory.value = key
    const c = categories.find((x) => x.key === key)
    showToast(`已筛选${c ? c.label : key}`)
  }
}

function openDialog(product) {
  activeProduct.value = product
}
function closeDialog() {
  activeProduct.value = null
}
function onDialogAction() {
  closeDialog()
  showToast('产品详情页开发中')
}
function onRegion() {
  showToast('地区筛选暂未开放')
}
function onMore() {
  router.push('/category')
}
</script>

<style scoped>
.app-shell {
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 24px;
}

/* ===== 状态栏 ===== */
.status-bar {
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2px;
  font-size: 16px;
  font-weight: 750;
  color: #111;
}
.status-icons {
  font-size: 14px;
  letter-spacing: 1px;
}

/* ===== 品牌头 ===== */
.brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 17px 0 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}
.brand-logo {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(140deg, #54b950, #a6d73e);
  position: relative;
  overflow: hidden;
}
.brand-logo::before {
  content: '';
  position: absolute;
  width: 35px;
  height: 17px;
  background: #e9ffe2;
  border-radius: 100% 0 100% 0;
  transform: rotate(-25deg);
  left: 7px;
  top: 14px;
}
.brand-logo::after {
  content: '';
  position: absolute;
  width: 42px;
  height: 2px;
  background: #e9ffe2;
  transform: rotate(-42deg);
  left: 6px;
  top: 25px;
}
.brand-logo i {
  position: absolute;
  left: 15px;
  top: 8px;
  width: 25px;
  height: 30px;
  border-radius: 100% 0 100% 0;
  border: 2px solid rgba(255, 255, 255, 0.5);
  transform: rotate(20deg);
}
.brand strong {
  display: block;
  font-size: 23px;
  font-weight: 850;
  letter-spacing: 2px;
  color: #318d3b;
}
.brand small {
  display: block;
  font-size: 12px;
  color: #378d43;
  letter-spacing: 1px;
  margin-top: 2px;
}
.region-button {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  color: #222;
  font-size: 15px;
  padding: 8px 0;
  border: 0;
  cursor: pointer;
}
.map-pin {
  width: 16px;
  height: 16px;
  background: #329943;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: relative;
}
.map-pin::after {
  content: '';
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 50%;
  position: absolute;
  left: 5px;
  top: 5px;
}
.chevron {
  font-size: 18px;
  color: #555;
}

/* ===== 搜索 ===== */
.search-box {
  height: 48px;
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 6px 24px rgba(39, 94, 48, 0.06);
  display: flex;
  align-items: center;
  padding: 0 17px;
  gap: 12px;
  margin-bottom: 14px;
}
.search-icon {
  width: 18px;
  height: 18px;
  border: 2px solid #858994;
  border-radius: 50%;
  position: relative;
  flex: none;
}
.search-icon::after {
  content: '';
  position: absolute;
  width: 8px;
  height: 2px;
  background: #858994;
  right: -6px;
  bottom: -3px;
  transform: rotate(45deg);
}
.search-box input {
  border: 0;
  outline: 0;
  width: 100%;
  background: transparent;
  color: #333;
  font-size: 15px;
}
.search-box input::placeholder {
  color: #a1a5ad;
}
.clear-search {
  background: transparent;
  color: #aaa;
  font-size: 20px;
  padding: 0;
  border: 0;
  cursor: pointer;
}

/* ===== Hero ===== */
.hero {
  height: 190px;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  margin-bottom: 14px;
  background: #a4d38f;
}
.hero > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.15), transparent 70%);
  pointer-events: none;
}

/* ===== 分类 ===== */
.category-strip {
  background: #fff;
  border-radius: 20px;
  padding: 12px 6px 10px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 3px;
  margin-bottom: 22px;
  box-shadow: 0 6px 24px rgba(39, 94, 48, 0.06);
}
.category {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: #34383d;
  font-size: 13px;
  white-space: nowrap;
  padding: 3px 0;
  border: 0;
  cursor: pointer;
}
.category-art {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 33px;
}
.art-fruit {
  background: #f9e9e8;
}
.art-vegetable {
  background: #e8f5e6;
}
.art-grain {
  background: #fff4df;
}
.art-nut {
  background: #fbe9df;
}
.art-special {
  background: #e8f5e6;
}
.category.selected .category-art {
  outline: 2px solid #55b35d;
  outline-offset: 2px;
}

/* ===== 推荐 ===== */
.recommend-section {
  padding-bottom: 10px;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 2px 12px;
}
.section-heading h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  font-weight: 850;
  margin: 0;
}
.leaf-mark {
  width: 26px;
  height: 26px;
  background: linear-gradient(135deg, #43b34a, #b1db4d);
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 17px;
}
.more-button {
  color: #999;
  font-size: 14px;
  background: transparent;
  padding: 5px;
  border: 0;
  cursor: pointer;
}
.more-button span {
  font-size: 22px;
  vertical-align: -2px;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.product-card {
  background: #fff;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 6px 24px rgba(39, 94, 48, 0.06);
  transition: transform 0.15s;
}
.product-card:active {
  transform: scale(0.985);
}
.product-open {
  display: block;
  width: 100%;
  text-align: left;
  background: transparent;
  padding: 0;
  color: inherit;
  border: 0;
  cursor: pointer;
}
.product-photo {
  height: 135px;
  position: relative;
  overflow: hidden;
}
.product-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.product-content {
  padding: 10px 11px 13px;
}
.product-content h3 {
  font-size: 15px;
  font-weight: 750;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.origin {
  font-size: 12px;
  color: #9298a0;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 0 10px;
}
.origin::before {
  content: '📍';
  font-size: 11px;
}
.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.product-description {
  font-size: 11px;
  color: #777;
  max-width: 95px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.view-pill {
  background: linear-gradient(90deg, #48b94c, #29963b);
  color: #fff;
  border-radius: 20px;
  padding: 8px 11px;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}
.empty-state {
  text-align: center;
  color: #969ba3;
  padding: 35px 0;
  font-size: 14px;
}

/* ===== 详情弹窗 ===== */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22, 34, 24, 0.4);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
}
.product-dialog {
  position: relative;
  width: min(90%, 400px);
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 20px 70px rgba(0, 0, 0, 0.2);
  max-height: 80vh;
  overflow-y: auto;
}
.product-dialog > img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}
.dialog-close {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.87);
  color: #222;
  font-size: 24px;
  line-height: 1;
  border: 0;
  cursor: pointer;
}
.dialog-body {
  padding: 20px;
}
.dialog-tag {
  display: inline-block;
  background: #e9f6e9;
  color: #329943;
  font-size: 12px;
  padding: 4px 9px;
  border-radius: 14px;
}
.dialog-body h2 {
  margin: 10px 0;
  font-size: 21px;
}
.dialog-origin {
  color: #8d949c;
  font-size: 13px;
}
.dialog-body > p:last-of-type {
  font-size: 14px;
  line-height: 1.7;
}
.dialog-action {
  width: 100%;
  background: #329943;
  color: #fff;
  padding: 12px;
  border-radius: 24px;
  margin-top: 8px;
  border: 0;
  cursor: pointer;
  font-size: 15px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 360px) {
  .category-art {
    width: 50px;
    height: 50px;
    font-size: 29px;
  }
  .category {
    font-size: 12px;
  }
  .product-description {
    max-width: 78px;
  }
  .view-pill {
    padding: 7px 9px;
  }
}
</style>
