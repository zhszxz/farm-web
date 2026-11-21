<template>
  <div class="apply-shell">
    <header class="topbar">
      <button class="back-btn" @click="goBack">‹</button>
      <h1>申请成为商家</h1>
      <button class="help-btn" @click="helpVisible = true">帮助</button>
    </header>

    <main class="page">
      <div v-if="loading" class="loading">加载中…</div>

      <template v-else>
        <!-- Hero -->
        <section class="hero">
          <div class="hero-copy">
            <span class="leaf-mark">✦</span>
            <h2>加入清新果园</h2>
            <p>让优质农产品被更多人看见</p>
            <div class="hero-pill">🌱 与自然同行 · 共创好生活</div>
          </div>
          <div class="hero-art">
            <span class="sun"></span>
            <span class="leaf leaf-a"></span>
            <span class="leaf leaf-b"></span>
            <span class="leaf leaf-c"></span>
            <span class="fruit">🍎</span>
          </div>
        </section>

        <!-- 入驻流程 -->
        <section class="steps-card">
          <div class="section-heading">
            <span>入驻流程</span>
            <small>简单三步，开启经营</small>
          </div>
          <div class="steps">
            <div class="step" :class="{ active: stepsActive >= 1 }">
              <span class="step-num">1</span><b>填写资料</b><small>完善店铺信息</small>
            </div>
            <i class="step-line"></i>
            <div class="step" :class="{ active: stepsActive >= 2 }">
              <span class="step-num">2</span><b>平台审核</b><small>审核申请资料</small>
            </div>
            <i class="step-line"></i>
            <div class="step" :class="{ active: stepsActive >= 3 }">
              <span class="step-num">3</span><b>开店经营</b><small>发布优质产品</small>
            </div>
          </div>
        </section>

        <!-- 状态区 -->
        <section v-if="state !== 'none'" class="status-section">
          <div class="status-card" :style="statusStyle">
            <div class="status-title">
              <span class="status-badge">{{ statusLabel }}</span>
              <span>{{ statusTitle }}</span>
            </div>
            <p>{{ statusDesc }}</p>
            <p v-if="state === 'pending' && shop">
              提交时间：{{ fmtTime(shop.createTime) }} · 预计 1–3 个工作日
            </p>
            <div v-if="state === 'rejected'" class="reason">
              <b>驳回原因：</b>{{ (shop && shop.rejectReason) || '请根据审核意见修改资料后重新提交。' }}
            </div>
            <button v-if="state === 'approved'" class="status-action" @click="goMerchant">
              进入商家工作台 →
            </button>
            <button v-if="state === 'rejected'" class="status-action secondary" @click="scrollToForm">
              修改资料并重新提交
            </button>
          </div>

          <div v-if="state === 'pending' && shop" class="submitted-info">
            <h3>已提交资料</h3>
            <div class="summary-row"><span>店铺名称</span><span>{{ shop.shopName }}</span></div>
            <div class="summary-row"><span>所在地区</span><span>{{ shop.region }}</span></div>
            <div class="summary-row"><span>详细地址</span><span>{{ shop.address }}</span></div>
            <div class="summary-row"><span>联系人</span><span>{{ shop.contactName }}</span></div>
            <div class="summary-row"><span>联系电话</span><span>{{ shop.contactPhone }}</span></div>
            <div class="summary-row"><span>微信号</span><span>{{ shop.wechat || '未填写' }}</span></div>
            <div class="summary-row"><span>店铺简介</span><span>{{ shop.description || '未填写' }}</span></div>
          </div>
        </section>

        <!-- 表单（未申请 / 已驳回） -->
        <section v-if="editable" class="form-card">
          <div class="section-heading">
            <span>店铺资料</span>
            <small><em>*</em> 为必填项</small>
          </div>
          <p class="form-intro">
            {{ state === 'rejected' ? '请根据驳回原因修改后重新提交。' : '请填写真实信息，方便平台审核及用户联系。' }}
          </p>

          <div class="field" :class="{ invalid: errors.shopName }">
            <label>店铺名称 <em>*</em></label>
            <input
              v-model="form.shopName"
              maxlength="30"
              placeholder="例如：山野鲜果农场"
              @input="clearError('shopName')"
            />
            <small class="hint">2–30 个字符</small>
            <small class="error">{{ errors.shopName }}</small>
          </div>

          <div class="field" :class="{ invalid: errors.region }">
            <label>所在地区 <em>*</em></label>
            <input
              v-model="form.region"
              placeholder="省 · 市 · 区县 / 乡镇"
              @input="clearError('region')"
            />
            <small class="hint">请填写到区县或乡镇</small>
            <small class="error">{{ errors.region }}</small>
          </div>

          <div class="field" :class="{ invalid: errors.address }">
            <label>详细地址 <em>*</em></label>
            <input
              v-model="form.address"
              placeholder="村 / 组 / 门牌号等详细地址"
              @input="clearError('address')"
            />
            <small class="error">{{ errors.address }}</small>
          </div>

          <div class="field" :class="{ invalid: errors.contactName }">
            <label>联系人 <em>*</em></label>
            <input
              v-model="form.contactName"
              maxlength="20"
              placeholder="填写联系人姓名"
              @input="clearError('contactName')"
            />
            <small class="error">{{ errors.contactName }}</small>
          </div>

          <div class="field" :class="{ invalid: errors.contactPhone }">
            <label>联系电话 <em>*</em></label>
            <input
              v-model="form.contactPhone"
              inputmode="tel"
              placeholder="手机号或固定电话"
              @input="clearError('contactPhone')"
            />
            <small class="hint">用于平台审核及用户咨询</small>
            <small class="error">{{ errors.contactPhone }}</small>
          </div>

          <div class="field">
            <label>微信号 <span class="optional">选填</span></label>
            <input v-model="form.wechat" placeholder="填写微信号，方便联系" />
          </div>

          <div class="field">
            <label>店铺简介 <span class="optional">选填</span></label>
            <textarea
              v-model="form.description"
              rows="4"
              maxlength="200"
              placeholder="介绍您的农场、产品特色或种植方式…"
            ></textarea>
            <div class="count">{{ form.description ? form.description.length : 0 }}/200</div>
          </div>

          <div class="field">
            <label>资质证明 <span class="optional">选填</span></label>
            <p class="upload-note">可上传营业执照、种植基地证明等，帮助平台更快完成审核。</p>
            <template v-if="!licenseImage">
              <label class="upload-box">
                <span class="upload-plus">＋</span>
                <span>{{ uploading ? '上传中…' : '上传图片' }}</span>
                <small>JPG / PNG / WEBP · ≤ 5MB</small>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  @change="onFileChange"
                />
              </label>
            </template>
            <div v-else class="image-preview">
              <img :src="licenseImage" alt="资质图片预览" />
              <button class="remove-image" @click="removeImage">×</button>
            </div>
          </div>

          <button class="submit-btn" :disabled="submitting" @click="onSubmit">
            <span>{{ submitting ? '提交中…' : state === 'rejected' ? '重新提交申请' : '提交入驻申请' }}</span>
            <span>→</span>
          </button>
        </section>

        <div class="bottom-note">
          <span class="shield">✓</span>提交后由平台审核，审核结果可在本页面查看
        </div>
        <footer>清新果园 · 源自自然，健康美味</footer>
      </template>
    </main>

    <!-- 帮助弹窗 -->
    <div v-if="helpVisible" class="modal" @click.self="helpVisible = false">
      <div class="modal-panel">
        <button class="modal-close" @click="helpVisible = false">×</button>
        <h3>入驻说明</h3>
        <p>填写真实、完整的店铺信息后提交申请。平台将在 1–3 个工作日内审核，审核结果会在本页面展示。</p>
        <p>如申请被驳回，可根据原因修改资料并重新提交。</p>
        <button class="modal-ok" @click="helpVisible = false">我知道了</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { applyShop, getMyApply } from '../api/modules/auth'
import { uploadFile } from '../api/modules/product'

const router = useRouter()

const loading = ref(true)
const state = ref('none')
const shop = ref(null)
const submitting = ref(false)
const uploading = ref(false)
const helpVisible = ref(false)
const licenseImage = ref('')
const errors = ref({})

const form = ref({
  shopName: '',
  region: '',
  address: '',
  contactName: '',
  contactPhone: '',
  wechat: '',
  description: ''
})

const editable = computed(() => state.value === 'none' || state.value === 'rejected')

const stepsActive = computed(() => {
  if (state.value === 'pending') return 2
  if (state.value === 'approved') return 3
  return 1
})

const statusStyle = computed(() => {
  const map = {
    pending: { '--status': '#f08a24', '--status-bg': '#fff4e7' },
    approved: { '--status': '#35a853', '--status-bg': '#eaf7ed' },
    rejected: { '--status': '#e5484d', '--status-bg': '#fff0ef' }
  }
  return map[state.value] || {}
})

const statusLabel = computed(() => ({ pending: '审核中', approved: '已通过', rejected: '已驳回' }[state.value] || ''))
const statusTitle = computed(() => ({ pending: '申请已提交', approved: '入驻成功', rejected: '需要修改资料' }[state.value] || ''))
const statusDesc = computed(() =>
  ({
    pending: '资料已提交，平台正在审核。预计 1–3 个工作日完成审核，请耐心等待。',
    approved: '恭喜！您的店铺申请已审核通过，可以开始经营。',
    rejected: '请根据审核意见修改资料后重新提交。'
  }[state.value] || '')
)

function fmtTime(v) {
  if (!v) return '-'
  return String(v).replace('T', ' ').slice(0, 16)
}

function fillForm(s) {
  form.value = {
    shopName: s.shopName || '',
    region: s.region || '',
    address: s.address || '',
    contactName: s.contactName || '',
    contactPhone: s.contactPhone || '',
    wechat: s.wechat || '',
    description: s.description || ''
  }
  licenseImage.value = s.licenseImage || ''
}

async function load() {
  loading.value = true
  try {
    const res = await getMyApply()
    if (res) {
      shop.value = res
      fillForm(res)
      if (res.status === 1) state.value = 'approved'
      else if (res.status === 2) state.value = 'rejected'
      else state.value = 'pending'
    } else {
      state.value = 'none'
    }
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function clearError(key) {
  if (errors.value[key]) errors.value[key] = ''
}

function validate() {
  const v = form.value
  const errs = {}
  if (!v.shopName || v.shopName.length < 2 || v.shopName.length > 30) {
    errs.shopName = '店铺名称需为 2–30 个字符'
  }
  if (!v.region) errs.region = '请填写所在地区'
  if (!v.address) errs.address = '请填写详细地址'
  if (!v.contactName || v.contactName.length < 2 || v.contactName.length > 20) {
    errs.contactName = '联系人需为 2–20 个字符'
  }
  if (!/^(1\d{10}|0\d{2,3}-?\d{7,8})$/.test(v.contactPhone)) {
    errs.contactPhone = '请输入有效手机号或座机号码'
  }
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function onSubmit() {
  if (submitting.value) return
  if (!validate()) {
    showToast('请检查并完善必填资料')
    return
  }
  submitting.value = true
  try {
    await applyShop({
      shopName: form.value.shopName.trim(),
      region: form.value.region.trim(),
      address: form.value.address.trim(),
      contactName: form.value.contactName.trim(),
      contactPhone: form.value.contactPhone.trim(),
      wechat: form.value.wechat.trim(),
      description: form.value.description.trim(),
      licenseImage: licenseImage.value || null
    })
    showToast(state.value === 'rejected' ? '已重新提交，请等待审核' : '申请已提交，请等待审核')
    await load()
  } catch (e) {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

function onFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
    showToast('请选择 JPG / PNG / WEBP 图片')
    e.target.value = ''
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    showToast('图片不能超过 5MB')
    e.target.value = ''
    return
  }
  uploading.value = true
  uploadFile(file)
    .then((res) => {
      const url = typeof res === 'string' ? res : res && res.url
      if (url) {
        licenseImage.value = url
        showToast('图片已上传')
      } else {
        showToast('上传失败')
      }
    })
    .catch(() => {})
    .finally(() => {
      uploading.value = false
    })
}

function removeImage() {
  licenseImage.value = ''
}

function scrollToForm() {
  const el = document.querySelector('.apply-shell .form-card')
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function goMerchant() {
  router.push('/merchant')
}

function goBack() {
  router.back()
}

onMounted(load)
</script>

<style scoped>
.apply-shell {
  max-width: 480px;
  min-height: 100vh;
  margin: 0 auto;
  background: linear-gradient(180deg, #f2f8ee, #f7faf6 420px, #f5f8f4);
  padding-bottom: 30px;
}
.topbar {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: sticky;
  top: 0;
  z-index: 5;
  background: rgba(247, 250, 246, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e1ebdf;
}
.topbar h1 {
  font-size: 17px;
  font-weight: 600;
  margin: 0;
}
.back-btn,
.help-btn {
  position: absolute;
  border: 0;
  background: none;
  color: #319447;
  font-size: 16px;
  cursor: pointer;
  font-family: inherit;
}
.back-btn {
  left: 16px;
  font-size: 28px;
}
.help-btn {
  right: 16px;
}
.page {
  padding: 16px;
}
.loading {
  padding: 60px 0;
  text-align: center;
  color: #8c968e;
  font-size: 13px;
}

/* Hero */
.hero {
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 24px 20px 22px;
  background: linear-gradient(125deg, #e0f2d8, #f1f8dc 58%, #d6ebc8);
  min-height: 150px;
  box-shadow: 0 8px 22px #43853d12;
}
.hero-copy {
  position: relative;
  z-index: 2;
}
.leaf-mark {
  display: inline-flex;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #57ae55;
  color: #fff;
  align-items: center;
  justify-content: center;
}
.hero h2 {
  font-size: 24px;
  margin: 9px 0 5px;
  color: #2c803e;
}
.hero p {
  font-size: 13px;
  color: #57835b;
  margin: 0;
}
.hero-pill {
  display: inline-block;
  margin-top: 14px;
  padding: 6px 10px;
  border-radius: 20px;
  background: #ffffff94;
  font-size: 11px;
  color: #47804b;
}
.hero-art {
  position: absolute;
  right: 8px;
  bottom: 0;
  width: 145px;
  height: 130px;
}
.sun {
  position: absolute;
  width: 75px;
  height: 75px;
  border-radius: 50%;
  background: #f7d66c;
  right: 17px;
  top: 8px;
  opacity: 0.68;
}
.leaf {
  position: absolute;
  background: linear-gradient(140deg, #5eb85b, #2f8d43);
  border-radius: 100% 0 100% 0;
  transform: rotate(28deg);
}
.leaf-a {
  width: 80px;
  height: 44px;
  right: 44px;
  bottom: 22px;
}
.leaf-b {
  width: 52px;
  height: 29px;
  right: 7px;
  bottom: 46px;
  transform: rotate(-18deg);
  background: #76c76a;
}
.leaf-c {
  width: 55px;
  height: 34px;
  right: 65px;
  bottom: 4px;
  transform: rotate(70deg);
  background: #98d66f;
}
.fruit {
  position: absolute;
  right: 21px;
  bottom: 10px;
  font-size: 49px;
  filter: drop-shadow(0 5px 5px #9ab886);
}

/* 卡片 */
.steps-card,
.form-card {
  background: #fff;
  border-radius: 20px;
  padding: 18px 16px;
  margin-top: 14px;
  box-shadow: 0 5px 18px #25542d08;
}
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 650;
  font-size: 16px;
}
.section-heading small {
  font-size: 11px;
  color: #8c968e;
  font-weight: 400;
}
.section-heading em,
.field label em {
  font-style: normal;
  color: #e45c54;
}

/* 步骤 */
.steps {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-top: 18px;
}
.step {
  width: 28%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  color: #a5afa6;
}
.step-num {
  width: 29px;
  height: 29px;
  border-radius: 50%;
  border: 1px solid #dce5dc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  background: #f8faf8;
}
.step b {
  font-size: 12px;
  font-weight: 550;
}
.step small {
  font-size: 10px;
  white-space: nowrap;
}
.step.active {
  color: #319447;
}
.step.active .step-num {
  background: #319447;
  border-color: #319447;
  color: #fff;
  box-shadow: 0 3px 8px #b5dcb7;
}
.step-line {
  height: 1px;
  background: #e1e9e1;
  flex: 1;
  margin: 14px 3px;
}

/* 表单 */
.form-intro {
  font-size: 12px;
  color: #9aa39b;
  margin: 8px 0 18px;
}
.field {
  margin: 0 0 16px;
  position: relative;
}
.field label {
  display: block;
  font-size: 13px;
  font-weight: 550;
  margin-bottom: 8px;
}
.field input,
.field textarea {
  width: 100%;
  border: 1px solid #e7ece7;
  background: #fbfdfb;
  border-radius: 12px;
  padding: 12px 13px;
  font-size: 14px;
  color: #29352b;
  outline: none;
  transition: 0.2s;
  font-family: inherit;
  box-sizing: border-box;
}
.field input:focus,
.field textarea:focus {
  border-color: #77bd7b;
  box-shadow: 0 0 0 3px #31944714;
}
.field input::placeholder,
.field textarea::placeholder {
  color: #b4bcb5;
}
.field textarea {
  resize: vertical;
  min-height: 95px;
}
.hint,
.error {
  display: block;
  font-size: 11px;
  margin-top: 5px;
  color: #a0aaa1;
}
.error {
  color: #df5b53;
  min-height: 0;
}
.field.invalid input,
.field.invalid textarea {
  border-color: #e66b65;
}
.optional {
  font-size: 11px;
  color: #9da69d;
  font-weight: 400;
  margin-left: 5px;
}
.count {
  text-align: right;
  font-size: 10px;
  color: #a0aaa1;
  margin-top: 4px;
}
.upload-note {
  font-size: 11px;
  color: #9aa39b;
  line-height: 1.6;
  margin: 0 0 9px;
}
.upload-box {
  height: 110px;
  border: 1px dashed #cbdccc;
  border-radius: 13px;
  background: #f8fcf7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 5px;
  color: #4b9855;
  cursor: pointer;
}
.upload-plus {
  font-size: 24px;
  line-height: 1;
}
.upload-box small {
  font-size: 10px;
  color: #a1aba2;
}
.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 10px;
}
.image-preview img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}
.remove-image {
  position: absolute;
  right: -7px;
  top: -7px;
  border: 0;
  border-radius: 50%;
  background: #e45c54;
  color: #fff;
  width: 22px;
  height: 22px;
  cursor: pointer;
  line-height: 1;
}
.submit-btn {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 25px;
  background: linear-gradient(90deg, #48ad51, #2d9143);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 5px 12px #3194472e;
  margin-top: 22px;
  font-family: inherit;
}
.submit-btn:disabled {
  opacity: 0.65;
  cursor: wait;
}

/* 状态卡 */
.status-section {
  margin-top: 14px;
}
.status-card {
  padding: 18px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 5px 18px #25542d08;
  border-left: 4px solid var(--status);
}
.status-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 650;
  font-size: 16px;
}
.status-badge {
  font-size: 11px;
  padding: 5px 9px;
  border-radius: 20px;
  background: var(--status-bg);
  color: var(--status);
}
.status-card p {
  font-size: 12px;
  color: #7e897f;
  line-height: 1.7;
  margin: 10px 0;
}
.reason {
  padding: 11px;
  border-radius: 12px;
  background: #fff5f4;
  color: #c74e49;
  font-size: 12px;
  margin: 10px 0;
  line-height: 1.7;
}
.submitted-info {
  margin-top: 12px;
  background: #fff;
  border-radius: 18px;
  padding: 17px;
}
.submitted-info h3 {
  font-size: 14px;
  margin: 0 0 12px;
}
.summary-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f3f0;
  font-size: 12px;
}
.summary-row:last-child {
  border-bottom: 0;
}
.summary-row span:first-child {
  width: 72px;
  color: #9aa39b;
  flex-shrink: 0;
}
.summary-row span:last-child {
  color: #465148;
  word-break: break-word;
}
.status-action {
  width: 100%;
  padding: 12px;
  border: 0;
  border-radius: 24px;
  background: #319447;
  color: #fff;
  font-weight: 600;
  margin-top: 12px;
  cursor: pointer;
  font-family: inherit;
}
.status-action.secondary {
  background: #f0f7ed;
  color: #319447;
}

/* 底部 */
.bottom-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #9aa49a;
  font-size: 11px;
  padding: 18px 4px;
}
.shield {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e4f4e3;
  color: #4ba453;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}
footer {
  text-align: center;
  font-size: 10px;
  color: #c1c9c0;
  padding: 8px 0 20px;
}

/* Modal */
.modal {
  position: fixed;
  inset: 0;
  background: #14221861;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 30;
}
.modal-panel {
  width: min(100%, 340px);
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  position: relative;
}
.modal-panel h3 {
  margin: 0 0 12px;
}
.modal-panel p {
  font-size: 13px;
  line-height: 1.7;
  color: #667267;
  margin: 0 0 10px;
}
.modal-close {
  position: absolute;
  right: 15px;
  top: 10px;
  border: 0;
  background: none;
  font-size: 24px;
  color: #9aa39b;
  cursor: pointer;
}
.modal-ok {
  width: 100%;
  border: 0;
  background: #319447;
  color: #fff;
  padding: 11px;
  border-radius: 22px;
  margin-top: 10px;
  cursor: pointer;
  font-family: inherit;
}

@media (min-width: 481px) {
  .apply-shell {
    border-radius: 28px;
    overflow: hidden;
  }
  .topbar {
    position: relative;
  }
}
</style>
