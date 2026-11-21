/**
 * 后端 images 字段为 string（JSON），这里做兼容解析：
 * - 数组：直接返回
 * - JSON 字符串：解析为数组
 * - 普通字符串：当作单个 URL
 */
export function parseImages(images) {
  if (!images) return []
  if (Array.isArray(images)) return images.filter(Boolean)
  if (typeof images !== 'string') return []
  const s = images.trim()
  if (!s) return []
  if (s.startsWith('[')) {
    try {
      const arr = JSON.parse(s)
      return Array.isArray(arr) ? arr.filter(Boolean) : []
    } catch (e) {
      return []
    }
  }
  return [s]
}

export function firstImage(images) {
  const arr = parseImages(images)
  return arr.length ? arr[0] : ''
}

export function formatMoney(value) {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (Number.isNaN(n)) return String(value)
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

const SEASON_MAP = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
  all: '全年'
}

export function seasonText(season) {
  if (!season) return ''
  return SEASON_MAP[season] || season
}

const UNIT_MAP = {
  jin: '斤',
  kg: '公斤',
  box: '箱',
  ton: '吨'
}

export function unitText(unit) {
  if (!unit) return ''
  return UNIT_MAP[unit] || unit
}

const CATEGORY_EMOJI = {
  苹果: '🍎',
  梨: '🍐',
  桃: '🍑',
  葡萄: '🍇',
  果干: '🥭',
  西瓜: '🍉',
  橘子: '🍊',
  橙子: '🍊',
  蔬菜: '🥬',
  枣: '🫘'
}

export function categoryEmoji(name) {
  if (!name) return '🌿'
  return CATEGORY_EMOJI[name] || '🌿'
}

/**
 * 复制文本：优先 Clipboard API，降级到 execCommand
 */
export async function copyText(text) {
  if (text === null || text === undefined) return false
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(String(text))
      return true
    }
  } catch (e) {
    // 继续走降级方案
  }
  try {
    const ta = document.createElement('textarea')
    ta.value = String(text)
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch (e) {
    return false
  }
}

export function maskPhone(phone) {
  if (!phone) return ''
  return String(phone).replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}
