import { defineStore } from 'pinia'
import {
  loginBySms as apiLoginBySms,
  loginByPassword as apiLoginByPassword,
  register as apiRegister,
  getMe
} from '../api/modules/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    role: Number(localStorage.getItem('role')) || 0,
    user: null,
    loaded: false
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isMerchant: (state) => state.role === 2,
    isAdmin: (state) => state.role === 3
  },
  actions: {
    setAuth(data) {
      this.token = data.token
      this.role = data.role
      localStorage.setItem('token', data.token)
      localStorage.setItem('role', String(data.role))
      this.user = { id: data.userId, nickname: data.nickname, phone: data.phone }
      this.loaded = true
    },
    async loginBySms(payload) {
      const data = await apiLoginBySms(payload)
      this.setAuth(data)
      return data
    },
    async loginByPassword(payload) {
      const data = await apiLoginByPassword(payload)
      this.setAuth(data)
      return data
    },
    async register(payload) {
      const data = await apiRegister(payload)
      this.setAuth(data)
      return data
    },
    async fetchMe() {
      const user = await getMe()
      this.user = user
      this.role = user.role
      this.loaded = true
      return user
    },
    logout() {
      this.token = ''
      this.role = 0
      this.user = null
      this.loaded = false
      localStorage.removeItem('token')
      localStorage.removeItem('role')
    }
  }
})
