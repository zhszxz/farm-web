<template>
  <div>
    <div class="heading">
      <div>
        <h1>商家入驻审核</h1>
        <p>审核商家入驻申请，维护平台商家资质与服务质量。</p>
      </div>
      <button class="btn" @click="load">↻ 刷新</button>
    </div>

    <section class="panel">
      <div class="filter">
        <label>审核状态</label>
        <button
          v-for="t in statusTabs"
          :key="t.value"
          class="tab"
          :class="{ active: status === t.value }"
          @click="changeStatus(t.value)"
        >
          {{ t.label }}
        </button>
        <span class="spacer"></span>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>店铺名称</th>
              <th>联系人</th>
              <th>联系电话</th>
              <th>所在地区</th>
              <th>申请时间</th>
              <th>状态</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in rows" :key="s.id">
              <td>{{ s.shopName }}</td>
              <td>{{ s.contactName || '-' }}</td>
              <td>{{ s.contactPhone || '-' }}</td>
              <td>{{ s.region || '-' }}</td>
              <td style="color: #94a3b8">{{ fmtTime(s.createTime) }}</td>
              <td><span class="status" :class="statusCls(s.status)">{{ statusLabel(s.status) }}</span></td>
              <td>
                <div class="actions">
                  <button class="text-btn" @click="openDetail(s)">查看</button>
                  <template v-if="s.status === 0">
                    <button class="text-btn" @click="onApprove(s)">通过</button>
                    <button class="text-btn red" @click="openReject(s)">驳回</button>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="!rows.length"><td colspan="7" class="empty">暂无数据</td></tr>
          </tbody>
        </table>
      </div>

      <div class="foot">
        <span>共 {{ total }} 条记录</span>
        <AdminPager :page="page" :total="total" :size="size" @change="onPage" />
      </div>
    </section>

    <AdminModal v-model="detailVisible" title="商家申请详情">
      <div v-if="current" style="display: grid; grid-template-columns: 90px 1fr; gap: 10px">
        <span>店铺名称</span><b>{{ current.shopName }}</b>
        <span>联系人</span><span>{{ current.contactName || '-' }}</span>
        <span>联系电话</span><span>{{ current.contactPhone || '-' }}</span>
        <span>所在地区</span><span>{{ current.region || '-' }}</span>
        <span>详细地址</span><span>{{ current.address || '-' }}</span>
        <span>微信</span><span>{{ current.wechat || '-' }}</span>
        <span>经营介绍</span><span>{{ current.description || '-' }}</span>
        <span>资质证明</span>
        <span>
          <template v-if="current.licenseImage">
            <img
              :src="current.licenseImage"
              alt="资质证明"
              class="license-img"
              @click="openLicense"
            />
            <div class="license-tip">点击图片可查看大图</div>
          </template>
          <span v-else class="muted">未上传</span>
        </span>
        <span>申请时间</span><span>{{ fmtTime(current.createTime) }}</span>
      </div>
      <template #footer>
        <button class="btn" @click="detailVisible = false">关闭</button>
        <template v-if="current && current.status === 0">
          <button class="btn danger" @click="openReject(current)">驳回</button>
          <button class="btn primary" @click="onApprove(current)">通过审核</button>
        </template>
      </template>
    </AdminModal>

    <AdminModal v-model="rejectVisible" title="驳回商家申请">
      <div class="admin-form-row">
        <label>驳回原因（必填）</label>
        <textarea v-model="rejectReason" placeholder="请填写具体原因，便于申请人修改"></textarea>
      </div>
      <template #footer>
        <button class="btn" @click="rejectVisible = false">取消</button>
        <button class="btn danger" @click="confirmReject">确认驳回</button>
      </template>
    </AdminModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listShops, auditShop } from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'
import AdminModal from '../../components/AdminModal.vue'
import AdminPager from '../../components/AdminPager.vue'

const statusTabs = [
  { value: 0, label: '待审核' },
  { value: 1, label: '已通过' },
  { value: 2, label: '已驳回' },
  { value: 'all', label: '全部' }
]
const status = ref(0)
const rows = ref([])
const total = ref(0)
const page = ref(1)
const size = 10
const detailVisible = ref(false)
const rejectVisible = ref(false)
const current = ref(null)
const rejectReason = ref('')

function statusLabel(s) {
  return { 0: '待审核', 1: '已通过', 2: '已驳回' }[s] || '-'
}
function statusCls(s) {
  return s === 0 ? 'pending' : s === 1 ? 'approved' : 'rejected'
}
function fmtTime(v) {
  if (!v) return '-'
  return String(v).replace('T', ' ').slice(0, 16)
}

function openLicense() {
  if (current.value && current.value.licenseImage) {
    window.open(current.value.licenseImage, '_blank')
  }
}

async function load() {
  const params = { page: page.value, size }
  if (status.value !== 'all') params.status = status.value
  try {
    const res = await listShops(params)
    rows.value = res.records || []
    total.value = res.total || 0
  } catch (e) {
    adminToast('加载失败')
  }
}

function changeStatus(v) {
  status.value = v
  page.value = 1
  load()
}
function onPage(p) {
  page.value = p
  load()
}
function openDetail(s) {
  current.value = s
  detailVisible.value = true
}
function openReject(s) {
  current.value = s
  rejectReason.value = ''
  rejectVisible.value = true
  detailVisible.value = false
}

async function onApprove(s) {
  try {
    await auditShop(s.id, { pass: true })
    adminToast('已通过商家审核')
    detailVisible.value = false
    load()
  } catch (e) {
    adminToast('操作失败')
  }
}

async function confirmReject() {
  if (!rejectReason.value.trim()) {
    adminToast('请填写驳回原因')
    return
  }
  try {
    await auditShop(current.value.id, { pass: false, reason: rejectReason.value.trim() })
    adminToast('已驳回申请')
    rejectVisible.value = false
    load()
  } catch (e) {
    adminToast('操作失败')
  }
}

onMounted(load)
</script>

<style scoped>
.license-img {
  width: 140px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e9eef5;
  cursor: pointer;
  display: block;
}
.license-tip {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}
.muted {
  color: #94a3b8;
}
</style>
