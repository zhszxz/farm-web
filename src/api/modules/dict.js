import http from '../http'

/** 销售渠道（登录可用） */
export const getChannels = () => http.get('/dicts/channels')

/** 成本类型（登录可用） */
export const getCostTypes = () => http.get('/dicts/cost-types')

/** 通用字典（unit/season 等） */
export const getDicts = (dictType) => http.get('/dicts', { params: { dictType } })
