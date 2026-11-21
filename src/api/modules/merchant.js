import http from '../http'

// 店铺
export const getShop = () => http.get('/merchant/shop')
export const updateShop = (data) => http.put('/merchant/shop', data)

// 拼多多链接
export const listLinks = (params) => http.get('/merchant/links', { params })
export const addLink = (data) => http.post('/merchant/links', data)
export const updateLink = (id, data) => http.put(`/merchant/links/${id}`, data)
export const deleteLink = (id) => http.delete(`/merchant/links/${id}`)

// 产品
export const listProducts = (params) => http.get('/merchant/products', { params })
export const addProduct = (data) => http.post('/merchant/products', data)
export const updateProduct = (id, data) => http.put(`/merchant/products/${id}`, data)
export const deleteProduct = (id) => http.delete(`/merchant/products/${id}`)
export const updateProductStatus = (id, status) =>
  http.put(`/merchant/products/${id}/status`, null, { params: { status } })

// 销售
export const listSales = (params) => http.get('/merchant/sales', { params })
export const addSale = (data) => http.post('/merchant/sales', data)
export const updateSale = (id, data) => http.put(`/merchant/sales/${id}`, data)
export const deleteSale = (id) => http.delete(`/merchant/sales/${id}`)
export const importSales = (file) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/merchant/sales/import', form)
}

// 产量
export const listProductions = (params) => http.get('/merchant/productions', { params })
export const addProduction = (data) => http.post('/merchant/productions', data)
export const updateProduction = (id, data) => http.put(`/merchant/productions/${id}`, data)
export const deleteProduction = (id) => http.delete(`/merchant/productions/${id}`)

// 成本
export const listCosts = (params) => http.get('/merchant/costs', { params })
export const addCost = (data) => http.post('/merchant/costs', data)
export const updateCost = (id, data) => http.put(`/merchant/costs/${id}`, data)
export const deleteCost = (id) => http.delete(`/merchant/costs/${id}`)

// 跳转统计
export const getClickStats = () => http.get('/merchant/click-stats')
