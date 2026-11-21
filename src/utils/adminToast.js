let timer = null

/**
 * 管理后台 Toast（对齐原型：#1e293b 深色胶囊，顶部居中）
 */
export function adminToast(message) {
  let el = document.getElementById('admin-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'admin-toast'
    el.className = 'admin-toast'
    document.body.appendChild(el)
  }
  el.textContent = message
  // 强制重排以重启动画
  void el.offsetWidth
  el.classList.add('show')
  clearTimeout(timer)
  timer = setTimeout(() => el.classList.remove('show'), 1700)
}
