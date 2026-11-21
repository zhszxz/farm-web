<template>
  <div class="placeholder">
    <h2>{{ $route.meta.title || '页面' }}</h2>
    <div class="path">{{ $route.path }}</div>
    <p class="tip">Phase 0 占位页，Phase 1 起替换为真实页面。</p>
  </div>
</template>

<style scoped>
.placeholder {
  padding: 40px 20px;
  text-align: center;
}
.placeholder h2 {
  margin: 0 0 8px;
  font-size: var(--fs-h2);
  color: var(--text);
}
.path {
  font-size: var(--fs-small);
  color: var(--text-3);
  font-family: monospace;
  margin-bottom: 16px;
}
.tip {
  font-size: var(--fs-small);
  color: var(--text-3);
}
</style>
