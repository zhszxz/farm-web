// Mock 开关与适配器：VITE_USE_MOCK=true 时启用
export const mockEnabled = import.meta.env.VITE_USE_MOCK === 'true'

function ok(data = null) {
  return { code: 0, message: 'ok', data }
}

/**
 * 极简 mock：按 URL 返回少量示例数据，用于验证"前后端切换"与页面基本渲染。
 * 真实业务数据以真实后端为准。
 */
export function mockAdapter(config) {
  const url = config.url || ''
  const method = (config.method || 'get').toUpperCase()
  let data = null

  if (url.includes('/health')) {
    data = { status: 'UP', db: 'mock' }
  } else if (url.includes('/auth/login')) {
    data = { token: 'mock-token', userId: 1, nickname: '模拟用户', phone: '13800000000', role: 1 }
  } else if (url.includes('/user/me')) {
    data = { id: 1, nickname: '模拟用户', phone: '13800000000', role: 1, status: 1 }
  } else if (url.includes('/categories')) {
    data = [
      { id: 1, name: '苹果', parentId: 0, level: 1, sort: 1, status: 1 },
      { id: 2, name: '红富士', parentId: 1, level: 2, sort: 1, status: 1 }
    ]
  } else if (url.includes('/home/')) {
    data = []
  } else if (url.includes('/products') && method === 'GET') {
    data = { records: [], total: 0, page: 1, size: 10 }
  }

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: ok(data), status: 200, statusText: 'OK', headers: {}, config })
    }, 200)
  })
}
