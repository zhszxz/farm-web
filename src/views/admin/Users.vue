<template>
  <div>
    <div class="heading">
      <div>
        <h1>用户管理</h1>
        <p>查看平台用户信息，管理用户状态与角色。</p>
      </div>
      <button class="btn" @click="load">↻ 刷新</button>
    </div>

    <section class="panel">
      <div class="filter">
        <label>用户角色</label>
        <select v-model="role" class="select" @change="onFilter">
          <option v-for="r in roles" :key="r.value" :value="r.value">{{ r.label }}</option>
        </select>
        <input
          v-model="phone"
          class="input"
          placeholder="输入手机号搜索"
          @keyup.enter="onFilter"
        />
        <button class="btn primary" @click="onFilter">搜索</button>
        <span class="spacer"></span>
      </div>

      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>用户 ID</th>
              <th>昵称</th>
              <th>手机号</th>
              <th>角色</th>
              <th>状态</th>
              <th>注册时间</th>
              <th style="text-align: right">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in rows" :key="u.id">
              <td style="color: #94a3b8">{{ u.id }}</td>
              <td>{{ u.nickname || '-' }}</td>
              <td>{{ u.phone || '-' }}</td>
              <td><span class="status neutral">{{ roleLabel(u.role) }}</span></td>
              <td><span class="status" :class="u.status === 1 ? 'active' : 'disabled'">{{ u.status === 1 ? '正常' : '已禁用' }}</span></td>
              <td style="color: #94a3b8">{{ fmtTime(u.createTime) }}</td>
              <td>
                <div class="actions">
                  <span v-if="u.role === 3" style="color: #94a3b8">不可操作</span>
                  <button
                    v-else
                    class="text-btn"
                    :class="{ red: u.status === 1 }"
                    @click="toggleStatus(u)"
                  >
                    {{ u.status === 1 ? '禁用' : '启用' }}
                  </button>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { listUsers, updateUserStatus } from '../../api/modules/admin'
import { adminToast } from '../../utils/adminToast'
import AdminPager from '../../components/AdminPager.vue'

const roles = [
  { value: 'all', label: '全部角色' },
  { value: 1, label: '普通用户' },
  { value: 2, label: '商家' },
  { value: 3, label: '管理员' }
]
const role = ref('all')
const phone = ref('')
const rows = ref([])
const total = ref(0)
const page = ref(1)
const size = 10

function roleLabel(r) {
  return { 1: '普通用户', 2: '商家', 3: '管理员' }[r] || '-'
}
function fmtTime(v) {
  if (!v) return '-'
  return String(v).replace('T', ' ').slice(5, 16)
}

async function load() {
  const params = { page: page.value, size }
  if (role.value !== 'all') params.role = role.value
  if (phone.value.trim()) params.phone = phone.value.trim()
  try {
    const res = await listUsers(params)
    rows.value = res.records || []
    total.value = res.total || 0
  } catch (e) {
    adminToast('加载失败')
  }
}

function onFilter() {
  page.value = 1
  load()
}
function onPage(p) {
  page.value = p
  load()
}

async function toggleStatus(u) {
  const next = u.status === 1 ? 0 : 1
  try {
    await updateUserStatus(u.id, next)
    adminToast(next === 1 ? '已启用该用户' : '已禁用该用户')
    load()
  } catch (e) {
    adminToast('操作失败')
  }
}

onMounted(load)
</script>
