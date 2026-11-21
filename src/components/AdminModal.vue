<template>
  <Teleport to="body">
    <div v-if="modelValue" class="admin-backdrop" @click.self="close">
      <div class="admin-modal">
        <div class="admin-modal-head">
          <b>{{ title }}</b>
          <button class="admin-close" @click="close">×</button>
        </div>
        <div class="admin-modal-body"><slot /></div>
        <div v-if="$slots.footer" class="admin-modal-foot"><slot name="footer" /></div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>
