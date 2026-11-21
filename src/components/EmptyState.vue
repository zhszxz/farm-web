<template>
  <div class="empty-state">
    <div class="icon">{{ icon }}</div>
    <p class="text">{{ text }}</p>
    <slot />
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: '暂无数据' },
  icon: { type: String, default: '🌾' }
})
</script>

<style scoped>
.empty-state {
  padding: 48px 20px;
  text-align: center;
  color: var(--text-3);
}
.empty-state .icon {
  font-size: 44px;
  line-height: 1;
}
.empty-state .text {
  margin-top: 12px;
  font-size: var(--fs-small);
}
</style>
