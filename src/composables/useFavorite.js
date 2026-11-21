import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showSuccessToast } from 'vant'
import { addFavorite } from '../api/modules/social'
import { useAuthStore } from '../stores/auth'

/**
 * 收藏动作：
 * - 未登录 → 跳登录并携带回跳地址
 * - 已登录 → 调接口 + Toast 反馈
 * 说明：后端无"是否已收藏"查询接口，故不做持久化高亮。
 */
export function useFavorite() {
  const router = useRouter()
  const route = useRoute()
  const auth = useAuthStore()
  const favoriting = ref(false)

  async function favorite(targetType, targetId) {
    if (!auth.isLoggedIn) {
      router.push({ path: '/login', query: { redirect: route.fullPath } })
      return false
    }
    if (favoriting.value) return false
    favoriting.value = true
    try {
      await addFavorite({ targetType, targetId })
      showSuccessToast('已收藏')
      return true
    } catch (e) {
      // 拦截器已统一提示
      return false
    } finally {
      favoriting.value = false
    }
  }

  return { favorite, favoriting }
}
