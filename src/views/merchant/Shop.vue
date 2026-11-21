<template>
  <div>
    <div class="page-head">
      <div>
        <h1>我的店铺</h1>
        <p>维护店铺信息、外部购买链接与消费者留言。</p>
      </div>
      <div class="head-actions">
        <button class="btn primary" @click="openEdit">✎ 编辑店铺</button>
      </div>
    </div>

    <div class="grid shop-layout">
      <div class="card">
        <div class="shop-card">
          <div class="shop-logo">🌾</div>
          <div>
            <h2>
              {{ shop.shopName || '我的店铺' }}
              <span class="status">{{ shop.status === 1 ? '已审核' : shop.status === 0 ? '审核中' : '已驳回' }}</span>
            </h2>
            <p>{{ shop.region || '地区待填' }}</p>
          </div>
        </div>
        <div class="detail-list" style="margin-top: 22px">
          <div class="detail"><label>店铺名称</label><strong>{{ shop.shopName || '-' }}</strong></div>
          <div class="detail"><label>经营者</label><strong>{{ shop.contactName || '-' }}</strong></div>
          <div class="detail"><label>联系电话</label><strong>{{ shop.contactPhone || '-' }}</strong></div>
          <div class="detail"><label>微信号</label><strong>{{ shop.wechat || '-' }}</strong></div>
          <div class="detail"><label>店铺简介</label><strong>{{ shop.description || '-' }}</strong></div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>跳转统计</h3><span>累计</span></div>
        <div class="stat-value">{{ clickTotal }} <small style="font-size: 14px; font-weight: 500">次</small></div>
        <div class="bar-list" style="margin-top: 22px">
          <div v-for="x in clickByProduct" :key="x.id" class="bar-row">
            <span>{{ productName(x.id) }}</span>
            <div class="progress"><span :style="{ width: x.pct + '%' }"></span></div>
            <strong>{{ x.count }}</strong>
          </div>
          <div v-if="!clickByProduct.length" style="color: #8b96a5">暂无跳转数据</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">
          <h3>拼多多购买链接</h3>
          <button class="btn small primary" @click="openLinkCreate">＋ 新增链接</button>
        </div>
        <div class="detail-list">
          <div v-for="l in links" :key="l.id" class="detail">
            <div>
              <strong>{{ l.linkName }}</strong>
              <small style="display: block; color: #8b96a5; margin-top: 5px">{{ l.linkUrl }}</small>
            </div>
            <div style="display: flex; gap: 8px; align-items: center">
              <span class="status" :class="{ off: l.status !== 1 }">{{ l.status === 1 ? '启用' : '停用' }}</span>
              <button class="btn small" @click="openLinkEdit(l)">编辑</button>
              <button class="btn small danger" @click="onDeleteLink(l)">删除</button>
            </div>
          </div>
          <div v-if="!links.length" style="color: #8b96a5">暂无链接，点击「新增链接」配置</div>
        </div>
      </div>

      <div class="card">
        <div class="card-title"><h3>消费者留言</h3><span>最近</span></div>
        <div class="detail-list">
          <div v-for="m in messages" :key="m.id" class="detail">
            <div>
              <strong>{{ m.userNickname || '用户' }}</strong>
              <small style="display: block; color: #8b96a5; margin-top: 5px">{{ m.content }}</small>
              <small v-if="m.reply" style="display: block; color: #18a957; margin-top: 4px">回复：{{ m.reply }}</small>
            </div>
            <button v-if="!m.reply" class="btn small" @click="openReply(m)">回复</button>
            <span v-else class="status">已回复</span>
          </div>
          <div v-if="!messages.length" style="color: #8b96a5">暂无留言</div>
        </div>
      </div>
    </div>

    <!-- 编辑店铺 -->
    <div v-if="editVisible" class="modal-backdrop show" @click.self="editVisible = false">
      <div class="modal">
        <div class="modal-head"><h3>编辑店铺</h3><button class="close" @click="editVisible = false">×</button></div>
        <div class="form-grid">
          <div class="form-field full"><label>店铺名称</label><input v-model="form.shopName" /></div>
          <div class="form-field"><label>所在地区</label><input v-model="form.region" /></div>
          <div class="form-field"><label>详细地址</label><input v-model="form.address" /></div>
          <div class="form-field"><label>联系人</label><input v-model="form.contactName" /></div>
          <div class="form-field"><label>联系电话</label><input v-model="form.contactPhone" /></div>
          <div class="form-field"><label>微信号</label><input v-model="form.wechat" /></div>
          <div class="form-field full"><label>店铺简介</label><textarea v-model="form.description" rows="3"></textarea></div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="editVisible = false">取消</button>
          <button class="btn primary" :disabled="saving" @click="saveShop">保存</button>
        </div>
      </div>
    </div>

    <!-- 链接弹窗 -->
    <div v-if="linkVisible" class="modal-backdrop show" @click.self="linkVisible = false">
      <div class="modal">
        <div class="modal-head"><h3>{{ editingLink ? '编辑链接' : '新增链接' }}</h3><button class="close" @click="linkVisible = false">×</button></div>
        <div class="form-grid">
          <div class="form-field full"><label>链接名称</label><input v-model="linkForm.linkName" placeholder="如：红富士苹果 · 5斤装" /></div>
          <div class="form-field full"><label>链接地址</label><input v-model="linkForm.linkUrl" placeholder="https://..." /></div>
          <div class="form-field"><label>平台</label><input v-model="linkForm.platform" placeholder="pdd" /></div>
          <div class="form-field"><label>状态</label><select v-model.number="linkForm.status"><option :value="1">启用</option><option :value="0">停用</option></select></div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="linkVisible = false">取消</button>
          <button class="btn primary" @click="saveLink">保存</button>
        </div>
      </div>
    </div>

    <!-- 回复弹窗 -->
    <div v-if="replyVisible" class="modal-backdrop show" @click.self="replyVisible = false">
      <div class="modal">
        <div class="modal-head"><h3>回复留言</h3><button class="close" @click="replyVisible = false">×</button></div>
        <div class="form-grid">
          <div class="form-field full"><label>留言内容</label><p style="color: #4c5664; margin: 0">{{ replying && replying.content }}</p></div>
          <div class="form-field full"><label>回复内容</label><textarea v-model="replyText" rows="3" placeholder="输入回复内容"></textarea></div>
        </div>
        <div class="modal-actions">
          <button class="btn" @click="replyVisible = false">取消</button>
          <button class="btn primary" @click="saveReply">发送回复</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  getShop,
  updateShop,
  listLinks,
  addLink,
  updateLink,
  deleteLink
} from '../../api/modules/merchant'
import { listProducts } from '../../api/modules/merchant'
import { getClickStats } from '../../api/modules/merchant'
import { listReceivedMessages, replyMessage } from '../../api/modules/social'
import { merchantToast } from '../../utils/merchantToast'

const shop = ref({})
const products = ref([])
const clickStats = ref({ total: 0, byProduct: [] })
const links = ref([])
const messages = ref([])

const editVisible = ref(false)
const saving = ref(false)
const form = ref({})

const linkVisible = ref(false)
const editingLink = ref(null)
const linkForm = ref({})

const replyVisible = ref(false)
const replying = ref(null)
const replyText = ref('')

const clickTotal = computed(() => clickStats.value.total || 0)
const productMap = computed(() => {
  const m = {}
  products.value.forEach((p) => {
    m[p.id] = p.name
  })
  return m
})
const clickByProduct = computed(() => {
  const list = (clickStats.value.byProduct || []).slice(0, 6)
  const max = Math.max(1, ...list.map((x) => Number(x.count || 0)))
  return list.map((x) => ({
    id: x.id,
    count: x.count,
    pct: Math.round((Number(x.count || 0) / max) * 100)
  }))
})

function productName(id) {
  return productMap.value[id] || `商品 #${id}`
}

async function load() {
  try {
    const [s, l, c, m, prods] = await Promise.all([
      getShop(),
      listLinks({ page: 1, size: 100 }),
      getClickStats(),
      listReceivedMessages({ page: 1, size: 20 }),
      listProducts({ page: 1, size: 500 })
    ])
    shop.value = s || {}
    links.value = (l && l.records) || []
    clickStats.value = c || { total: 0, byProduct: [] }
    messages.value = (m && m.records) || []
    products.value = (prods && prods.records) || []
  } catch (e) {
    merchantToast('加载失败')
  }
}

function openEdit() {
  form.value = { ...shop.value }
  editVisible.value = true
}
async function saveShop() {
  saving.value = true
  try {
    await updateShop(form.value)
    merchantToast('店铺资料已保存')
    editVisible.value = false
    await load()
  } catch (e) {
    merchantToast('保存失败')
  } finally {
    saving.value = false
  }
}

function openLinkCreate() {
  editingLink.value = null
  linkForm.value = { linkName: '', linkUrl: '', platform: 'pdd', status: 1 }
  linkVisible.value = true
}
function openLinkEdit(l) {
  editingLink.value = l
  linkForm.value = { ...l }
  linkVisible.value = true
}
async function saveLink() {
  try {
    if (editingLink.value) await updateLink(editingLink.value.id, linkForm.value)
    else await addLink(linkForm.value)
    merchantToast('已保存')
    linkVisible.value = false
    await load()
  } catch (e) {
    merchantToast('保存失败')
  }
}
async function onDeleteLink(l) {
  if (!window.confirm('确定删除该链接吗？')) return
  try {
    await deleteLink(l.id)
    merchantToast('已删除')
    await load()
  } catch (e) {
    merchantToast('删除失败')
  }
}

function openReply(m) {
  replying.value = m
  replyText.value = ''
  replyVisible.value = true
}
async function saveReply() {
  if (!replyText.value.trim()) {
    merchantToast('请输入回复内容')
    return
  }
  try {
    await replyMessage(replying.value.id, replyText.value.trim())
    merchantToast('已回复')
    replyVisible.value = false
    await load()
  } catch (e) {
    merchantToast('回复失败')
  }
}

onMounted(load)
</script>

<style scoped>
.form-field textarea {
  resize: vertical;
  font-family: inherit;
}
</style>
