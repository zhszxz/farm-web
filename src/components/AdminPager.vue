<template>
  <div class="pages">
    <button :disabled="page <= 1" @click="go(page - 1)">‹</button>
    <button
      v-for="p in pageList"
      :key="p"
      :class="{ selected: p === page }"
      @click="go(p)"
    >
      {{ p }}
    </button>
    <button :disabled="page >= totalPages" @click="go(page + 1)">›</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  size: { type: Number, default: 10 }
})
const emit = defineEmits(['change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.size)))

const pageList = computed(() => {
  const list = []
  const start = Math.max(1, props.page - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i += 1) list.push(i)
  return list
})

function go(p) {
  if (p >= 1 && p <= totalPages.value && p !== props.page) {
    emit('change', p)
  }
}
</script>
