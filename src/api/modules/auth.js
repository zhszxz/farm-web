import http from '../http'

export const sendSmsCode = (phone) => http.post('/auth/sms-code', { phone })
export const register = (data) => http.post('/auth/register', data)
export const loginByPassword = (data) => http.post('/auth/login/password', data)
export const loginBySms = (data) => http.post('/auth/login/sms', data)
export const getMe = () => http.get('/user/me')
export const applyShop = (data) => http.post('/shop/apply', data)
export const getMyApply = () => http.get('/shop/my-apply')
