import axios from 'axios'
import { showFailToast } from 'vant'
import { mockEnabled, mockAdapter } from '../mock'

export class ApiError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
  ...(mockEnabled ? { adapter: mockAdapter } : {})
})

// 请求拦截：注入 token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截：按 body.code 分支（后端 HTTP 恒 200）
http.interceptors.response.use(
  (response) => {
    // 文件下载（blob）直接返回原始响应
    if (response.config.responseType === 'blob') {
      return response
    }
    const res = response.data
    if (res.code === 0) {
      return res.data
    }
    if (res.code === 40100) {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      if (!location.pathname.startsWith('/login')) {
        const redirect = encodeURIComponent(location.pathname + location.search)
        location.href = `/login?redirect=${redirect}`
      }
      return Promise.reject(new ApiError(res.code, res.message))
    }
    // 40400（数据不存在）由页面自行处理空/失效态，避免全局 Toast 干扰
    if (res.code !== 40400) {
      showFailToast(res.message || '请求失败')
    }
    return Promise.reject(new ApiError(res.code, res.message))
  },
  (error) => {
    showFailToast('网络异常，请稍后重试')
    return Promise.reject(error)
  }
)

export default http
