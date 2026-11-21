import { ref, onMounted, onUnmounted } from 'vue'

/**
 * 响应式断点：默认 768px 以上视为桌面
 */
export function useResponsive(breakpoint = 768) {
  const isDesktop = ref(false)

  function update() {
    isDesktop.value = window.innerWidth >= breakpoint
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })
  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return { isDesktop }
}
