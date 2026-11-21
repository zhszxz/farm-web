<template>
  <div class="prod-image" :class="`ratio-${ratio}`">
    <img
      v-if="url && !failed"
      :src="url"
      alt=""
      loading="lazy"
      decoding="async"
      @error="failed = true"
    />
    <div v-else class="fallback">
      <span class="emoji">{{ emoji }}</span>
      <span class="hint">暂无实拍图</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { firstImage } from '../utils/format'

const props = defineProps({
  images: { type: [String, Array], default: null },
  emoji: { type: String, default: '🌿' },
  ratio: { type: String, default: 'square' }
})

const failed = ref(false)
const url = computed(() => firstImage(props.images))

watch(
  () => props.images,
  () => {
    failed.value = false
  }
)
</script>

<style scoped>
.prod-image {
  position: relative;
  overflow: hidden;
  background: #f5f0e8;
}
.prod-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.ratio-square {
  aspect-ratio: 1 / 1;
}
.ratio-4-3 {
  aspect-ratio: 4 / 3;
}
.ratio-16-9 {
  aspect-ratio: 16 / 9;
}
.fallback {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: linear-gradient(135deg, #f7d9b8, #ea9c4e);
}
.fallback .emoji {
  font-size: 42px;
  line-height: 1;
}
.fallback .hint {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 1px;
}
</style>
