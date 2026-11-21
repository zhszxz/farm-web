let timer = null

export function merchantToast(message) {
  let el = document.getElementById('merchant-toast')
  if (!el) {
    el = document.createElement('div')
    el.id = 'merchant-toast'
    el.className = 'merchant-toast'
    document.body.appendChild(el)
  }
  el.textContent = message
  void el.offsetWidth
  el.classList.add('show')
  clearTimeout(timer)
  timer = setTimeout(() => el.classList.remove('show'), 2200)
}
