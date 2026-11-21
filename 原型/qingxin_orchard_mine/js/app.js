const toastEl = document.getElementById('toast');
let toastTimer;
function toast(message){toastEl.textContent=message;toastEl.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastEl.classList.remove('show'),1900)}
const modal=document.getElementById('modal');
const modalTitle=document.getElementById('modalTitle');
const modalDesc=document.getElementById('modalDesc');
const modalSymbol=document.getElementById('modalSymbol');
function openModal(title,desc,symbol='🌿'){modalTitle.textContent=title;modalDesc.textContent=desc;modalSymbol.textContent=symbol;modal.hidden=false}
function closeModal(){modal.hidden=true}
document.getElementById('closeModal').addEventListener('click',closeModal);
document.getElementById('modalConfirm').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.getElementById('profileEntry').addEventListener('click',()=>openModal('个人资料','个人资料编辑功能将在正式版本开放。','👤'));
document.getElementById('profileEntry').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModal('个人资料','个人资料编辑功能将在正式版本开放。','👤')}});
document.querySelectorAll('.service-card').forEach(card=>card.addEventListener('click',()=>{
 const action=card.dataset.action;
 if(action==='收藏')openModal('我的收藏','这里将展示你收藏的农产品、果园和内容。','♡');
 if(action==='留言')openModal('我的留言','这里将展示你的咨询、留言及商家回复记录。','✉');
 if(action==='商家申请')openModal('申请成为商家','提交入驻申请后，平台将联系你进一步确认农产品信息与经营资质。','🏡');
}));
document.querySelectorAll('.nav-item').forEach(item=>item.addEventListener('click',()=>{
 document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));item.classList.add('active');
 const page=item.dataset.nav;if(page!=='我的')toast(`切换到${page}（原型演示）`);
}));
