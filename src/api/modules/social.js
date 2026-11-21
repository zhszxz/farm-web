import http from '../http'

// 收藏
export const addFavorite = (data) => http.post('/favorites', data)
export const removeFavorite = (targetType, targetId) =>
  http.delete(`/favorites/${targetType}/${targetId}`)
export const listFavorites = (params) => http.get('/user/favorites', { params })

// 留言
export const sendMessage = (data) => http.post('/messages', data)
export const listSentMessages = (params) => http.get('/messages/sent', { params })
export const listReceivedMessages = (params) => http.get('/messages/received', { params })
export const replyMessage = (id, reply) => http.post(`/messages/${id}/reply`, { reply })
