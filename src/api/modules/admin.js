import http from '../http'

export const getOverview = () => http.get('/admin/overview')
export const listShops = (params) => http.get('/admin/shops', { params })
export const auditShop = (id, data) => http.put(`/admin/shops/${id}/audit`, data)
export const listUsers = (params) => http.get('/admin/users', { params })
export const updateUserStatus = (id, status) =>
  http.put(`/admin/users/${id}/status`, null, { params: { status } })
export const listProducts = (params) => http.get('/admin/products', { params })
export const updateProductStatus = (id, status) =>
  http.put(`/admin/products/${id}/status`, null, { params: { status } })
export const setRecommend = (id, recommend) =>
  http.put(`/admin/products/${id}/recommend`, null, { params: { recommend } })
export const getClickStats = () => http.get('/admin/click-stats')

// 字典
export const listCategories = () => http.get('/admin/categories')
export const createCategory = (data) => http.post('/admin/categories', data)
export const updateCategory = (id, data) => http.put(`/admin/categories/${id}`, data)
export const deleteCategory = (id) => http.delete(`/admin/categories/${id}`)

export const listChannels = () => http.get('/admin/channels')
export const createChannel = (data) => http.post('/admin/channels', data)
export const updateChannel = (id, data) => http.put(`/admin/channels/${id}`, data)
export const deleteChannel = (id) => http.delete(`/admin/channels/${id}`)

export const listCostTypes = () => http.get('/admin/cost-types')
export const createCostType = (data) => http.post('/admin/cost-types', data)
export const updateCostType = (id, data) => http.put(`/admin/cost-types/${id}`, data)
export const deleteCostType = (id) => http.delete(`/admin/cost-types/${id}`)

export const listDicts = (dictType) => http.get('/admin/dicts', { params: { dictType } })
export const listDictTypes = () => http.get('/admin/dict-types')
export const createDict = (data) => http.post('/admin/dicts', data)
export const updateDict = (id, data) => http.put(`/admin/dicts/${id}`, data)
export const deleteDict = (id) => http.delete(`/admin/dicts/${id}`)
