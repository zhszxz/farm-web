import { useAuthStore } from '../stores/auth'

/**
 * 全局守卫：
 * - 需要登录的页面，未登录跳登录并携带回跳地址
 * - 已登录但未加载用户时，拉取 /user/me 校验
 * - 角色不匹配跳首页（仅体验层，后端仍会强校验）
 */
export function setupGuards(router) {
  router.beforeEach(async (to) => {
    const auth = useAuthStore()

    if (!to.meta.requiresAuth) {
      return true
    }

    if (!auth.isLoggedIn) {
      return { path: '/login', query: { redirect: to.fullPath } }
    }

    if (!auth.loaded) {
      try {
        await auth.fetchMe()
      } catch (e) {
        auth.logout()
        return { path: '/login', query: { redirect: to.fullPath } }
      }
    }

    const roles = to.meta.roles
    if (Array.isArray(roles) && roles.length && !roles.includes(auth.role)) {
      return { path: '/home' }
    }
    return true
  })

  router.afterEach((to) => {
    if (to.meta.title) {
      document.title = `${to.meta.title} · 农副产品平台`
    }
  })
}
