# farm-web · 农副产品平台前端

Vue 3 + **JavaScript（非 TS）** + Vite + Vant（移动端）+ Element Plus（桌面端）+ Pinia + Vue Router + Axios + ECharts。

## 快速开始

```bash
npm install
npm run dev      # http://localhost:5173
```

> 后端需运行在 `http://localhost:8080`，开发环境已配置 `/api` 代理。

## 命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 开发服务器 |
| `npm run build` | 生产构建 |
| `npm run lint` | ESLint 检查 |
| `npm run format` | Prettier 格式化 |

## 目录结构

```
src/
├── main.js            # 入口：Pinia / Router / Vant / Element Plus / 样式
├── App.vue
├── styles/
│   ├── tokens.css     # Design Tokens（颜色/圆角/间距/字号/阴影）
│   └── base.css       # 全局重置 + 覆盖 Vant/Element 主题变量
├── router/
│   ├── index.js       # 创建路由
│   ├── routes.js      # 路由表（含 meta: title/layout/requiresAuth/roles）
│   └── guards.js      # 全局守卫（登录/角色/回跳）
├── stores/
│   └── auth.js        # 登录态（token/user/role，持久化）
├── api/
│   ├── http.js        # Axios 封装（token 注入、按 code 分支、40100 处理、blob）
│   └── modules/       # auth/product/merchant/report/admin/social
├── mock/
│   └── index.js       # Mock 开关与适配器
├── layouts/
│   ├── PublicLayout.vue   # 消费者端（底部 Tab）
│   ├── MerchantLayout.vue # 商家端（顶部栏 + 底部 Tab）
│   └── AdminLayout.vue    # 管理员端（侧栏 + 顶栏）
└── views/
    └── Placeholder.vue    # Phase 0 占位页
```

## 说明

- **使用 JavaScript，不使用 TypeScript。**
- **Mock 切换**：`.env.development` 中 `VITE_USE_MOCK=true` 启用 mock（`src/mock`），默认走真实后端。
- **Phase 0** 为工程基础设施；各业务页面当前为 `Placeholder` 占位，Phase 1 起逐个替换为真实页面。
- **沙箱说明**：本会话沙箱因 esbuild 子进程受限（`spawn EPERM`）无法执行 `npm run build`；请在你本机终端运行 `npm install && npm run dev` 验证。
- 图片上传已接 MinIO：`POST /api/files/upload`（需登录）。
