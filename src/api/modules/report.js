import http from '../http'

export const getProfit = (params) => http.get('/reports/profit', { params })
export const getTrend = (params) => http.get('/reports/trend', { params })
export const getProductCompare = (params) => http.get('/reports/product-compare', { params })
export const getChannelShare = (params) => http.get('/reports/channel-share', { params })
export const getCategoryShare = (params) => http.get('/reports/category-share', { params })
export const getTop = (params) => http.get('/reports/top', { params })
export const exportProfit = (params) =>
  http.get('/reports/export', { params, responseType: 'blob' })
