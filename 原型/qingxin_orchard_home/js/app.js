const searchInput = document.querySelector('#searchInput');
const clearSearch = document.querySelector('#clearSearch');
const productCards = [...document.querySelectorAll('.product-card')];
const emptyState = document.querySelector('#emptyState');
const toastElement = document.querySelector('#toast');
let toastTimer;
let selectedCategory = '';

function showToast(message) {
  toastElement.textContent = message;
  toastElement.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastElement.classList.remove('show'), 1800);
}
function filterProducts() {
  const keyword = searchInput.value.trim().toLowerCase();
  clearSearch.style.display = keyword ? 'block' : 'none';
  let visible = 0;
  productCards.forEach(card => {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category;
    const matchKeyword = !keyword || name.includes(keyword) || category.includes(keyword);
    const matchCategory = !selectedCategory || category === selectedCategory;
    const show = matchKeyword && matchCategory;
    card.hidden = !show;
    if (show) visible++;
  });
  emptyState.hidden = visible > 0;
}
searchInput.addEventListener('input', filterProducts);
clearSearch.addEventListener('click', () => { searchInput.value = ''; filterProducts(); searchInput.focus(); });

document.querySelectorAll('.category').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.category').forEach(item => item.classList.remove('selected'));
  const clickedCategory = button.dataset.category;
  if (selectedCategory === clickedCategory) selectedCategory = '';
  else { selectedCategory = clickedCategory; button.classList.add('selected'); }
  filterProducts();
  showToast(selectedCategory ? `已筛选${button.textContent.trim()}` : '已显示全部推荐');
}));

document.querySelector('#regionButton').addEventListener('click', () => showToast('地区选择功能：原型演示'));
document.querySelector('#moreButton').addEventListener('click', () => showToast('更多推荐：原型演示'));

const dialog = document.querySelector('#productDialog');
const dialogImage = document.querySelector('#dialogImage');
const dialogTitle = document.querySelector('#dialogTitle');
const dialogOrigin = document.querySelector('#dialogOrigin');
const dialogDescription = document.querySelector('#dialogDescription');
document.querySelectorAll('.product-open').forEach(button => button.addEventListener('click', () => {
  const card = button.closest('.product-card');
  const image = card.querySelector('img');
  dialogImage.src = image.src;
  dialogImage.alt = image.alt;
  dialogTitle.textContent = card.dataset.name;
  dialogOrigin.textContent = card.dataset.origin;
  dialogDescription.textContent = card.dataset.desc;
  dialog.showModal();
}));
document.querySelector('#dialogClose').addEventListener('click', () => dialog.close());
document.querySelector('#dialogAction').addEventListener('click', () => { dialog.close(); showToast('产品介绍入口：后续接入产品详情页'); });
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  const page = button.dataset.page;
  if (page !== '首页') showToast(`${page}页面：原型演示`);
  else { selectedCategory = ''; searchInput.value = ''; document.querySelectorAll('.category').forEach(c => c.classList.remove('selected')); filterProducts(); }
}));

// Banner uses the locally bundled reference artwork, so no external image request is required.
