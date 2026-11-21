import http from '../http'

export const getCategories = (params) => http.get('/categories', { params })
export const getBanner = () => http.get('/home/banner')
export const getRecommend = () => http.get('/home/recommend')
export const getProducts = (params) => http.get('/products', { params })
export const getProductDetail = (id) => http.get(`/products/${id}`)
export const getShopHome = (id) => http.get(`/shops/${id}`)
export const getShopProducts = (id, params) => http.get(`/shops/${id}/products`, { params })
export const recordClick = (data) => http.post('/clicks', data)

// 图片上传（MinIO）
export const uploadFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return http.post('/files/upload', form)
}
