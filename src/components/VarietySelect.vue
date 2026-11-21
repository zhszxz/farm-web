<template>
  <div ref="rootRef" class="variety-select">
    <button type="button" class="variety-trigger" @click="toggle">
      <span :class="{ placeholder: !label }">{{ label || placeholder }}</span>
      <span class="chev">⌄</span>
    </button>

    <template v-if="open">
      <div class="variety-mask" @click="open = false"></div>
      <div class="variety-panel">
        <div
          v-if="allowClear"
          class="variety-clear"
          :class="{ active: modelValue === null || modelValue === '' }"
          @click="select(null)"
        >
          全部（不限）
        </div>

        <div v-if="loadingBig" class="variety-loading">加载中…</div>
        <template v-else>
          <div v-for="big in bigList" :key="big.id" class="variety-group">
            <div class="variety-big-row">
              <button
                type="button"
                class="variety-arrow"
                :aria-label="expandedBig === big.id ? '收起' : '展开'"
                @click.stop="toggleBig(big)"
              >
                {{ expandedBig === big.id ? '▾' : '▸' }}
              </button>
              <button
                type="button"
                class="variety-big"
                :class="{ active: modelValue === big.id }"
                @click="select(big.id)"
              >
                {{ big.name }}
              </button>
            </div>

            <div v-if="expandedBig === big.id" class="variety-children">
              <div v-if="loadingChildren" class="variety-loading">加载中…</div>
              <button
                v-for="small in childrenMap[big.id] || []"
                :key="small.id"
                type="button"
                class="variety-small"
                :class="{ active: modelValue === small.id }"
                @click="select(small.id)"
              >
                {{ small.name }}
              </button>
              <div
                v-if="!loadingChildren && !(childrenMap[big.id] || []).length"
                class="variety-empty"
              >
                暂无小类
              </div>
            </div>
          </div>
          <div v-if="!bigList.length" class="variety-empty">暂无分类</div>
        </template>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { getCategories } from '../api/modules/product'

defineProps({
  modelValue: { type: [Number, String], default: null },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '请选择品种' },
  allowClear: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const rootRef = ref(null)
const open = ref(false)
const loadingBig = ref(false)
const bigList = ref([])
const expandedBig = ref(null)
const childrenMap = ref({})
const loadingChildren = ref(false)

async function loadBig() {
  if (bigList.value.length) return
  loadingBig.value = true
  try {
    bigList.value = (await getCategories({ parentId: 0 })) || []
  } catch (e) {
    bigList.value = []
  } finally {
    loadingBig.value = false
  }
}

async function toggleBig(big) {
  if (expandedBig.value === big.id) {
    expandedBig.value = null
    return
  }
  expandedBig.value = big.id
  if (childrenMap.value[big.id]) return
  loadingChildren.value = true
  try {
    const list = (await getCategories({ parentId: big.id })) || []
    childrenMap.value = { ...childrenMap.value, [big.id]: list }
  } catch (e) {
    childrenMap.value = { ...childrenMap.value, [big.id]: [] }
  } finally {
    loadingChildren.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value) loadBig()
}

function select(id) {
  emit('update:modelValue', id)
  open.value = false
}
</script>

<style scoped>
.variety-select {
  position: relative;
  width: 100%;
}
.variety-trigger {
  width: 100%;
  height: 44px;
  border: 1px solid #e8edf0;
  border-radius: 9px;
  background: #fff;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1f2937;
  font-size: 14px;
  cursor: pointer;
  box-sizing: border-box;
}
.variety-trigger .placeholder {
  color: #9aa5b1;
}
.chev {
  color: #8792a0;
}
/* 透明遮罩：点击任意空白处关闭，避免 document 监听干扰 */
.variety-mask {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: transparent;
}
.variety-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  max-height: 280px;
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e8edf0;
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(15, 42, 28, 0.12);
  z-index: 60;
  padding: 6px;
}
.variety-clear {
  padding: 9px 10px;
  border-radius: 7px;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
}
.variety-clear:hover {
  background: #f4f8f4;
}
.variety-clear.active {
  color: #128747;
  font-weight: 650;
}
.variety-group {
  margin-bottom: 2px;
}
.variety-big-row {
  display: flex;
  align-items: center;
}
.variety-arrow {
  width: 26px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #8792a0;
  cursor: pointer;
  font-size: 12px;
}
.variety-big {
  flex: 1;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 8px 6px;
  border-radius: 7px;
  color: #1f2937;
  font-size: 14px;
  cursor: pointer;
}
.variety-big:hover {
  background: #f4f8f4;
}
.variety-big.active {
  color: #128747;
  font-weight: 650;
  background: #eaf8ef;
}
.variety-children {
  padding-left: 26px;
}
.variety-small {
  display: block;
  width: 100%;
  text-align: left;
  border: 0;
  background: transparent;
  padding: 8px 8px;
  border-radius: 7px;
  color: #4b5563;
  font-size: 13px;
  cursor: pointer;
}
.variety-small:hover {
  background: #f4f8f4;
}
.variety-small.active {
  color: #128747;
  font-weight: 650;
  background: #eaf8ef;
}
.variety-loading,
.variety-empty {
  padding: 10px;
  color: #9aa5b1;
  font-size: 12px;
  text-align: center;
}
</style>
