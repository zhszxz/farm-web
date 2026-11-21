import PublicLayout from '../layouts/PublicLayout.vue'
import MerchantLayout from '../layouts/MerchantLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import Placeholder from '../views/Placeholder.vue'
import Home from '../views/Home.vue'
import Category from '../views/Category.vue'
import ProductDetail from '../views/ProductDetail.vue'
import ShopHome from '../views/ShopHome.vue'
import Login from '../views/Login.vue'
import Mine from '../views/Mine.vue'
import Apply from '../views/Apply.vue'
import AdminOverview from '../views/admin/Overview.vue'
import AdminShops from '../views/admin/Shops.vue'
import AdminProducts from '../views/admin/Products.vue'
import AdminRecommend from '../views/admin/Recommend.vue'
import AdminUsers from '../views/admin/Users.vue'
import AdminDicts from '../views/admin/Dicts.vue'
import AdminStats from '../views/admin/Stats.vue'
import MerchantDashboard from '../views/merchant/Dashboard.vue'
import MerchantProducts from '../views/merchant/Products.vue'
import MerchantRecords from '../views/merchant/Records.vue'
import MerchantReports from '../views/merchant/Reports.vue'
import MerchantShop from '../views/merchant/Shop.vue'

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', redirect: '/home' },
      { path: 'home', component: Home, meta: { title: '首页', layout: 'public' } },
      { path: 'category', component: Category, meta: { title: '分类', layout: 'public' } },
      {
        path: 'mine',
        component: Mine,
        meta: { title: '我的', layout: 'public' }
      }
    ]
  },
  { path: '/product/:id', component: ProductDetail, meta: { title: '产品详情', layout: 'blank' } },
  { path: '/shop/:id', component: ShopHome, meta: { title: '商家主页', layout: 'blank' } },
  { path: '/login', component: Login, meta: { title: '登录', layout: 'blank' } },
  {
    path: '/favorites',
    component: Placeholder,
    meta: { title: '我的收藏', layout: 'blank', requiresAuth: true }
  },
  {
    path: '/messages',
    component: Placeholder,
    meta: { title: '我的留言', layout: 'blank', requiresAuth: true }
  },
  {
    path: '/apply',
    component: Apply,
    meta: { title: '商家入驻', layout: 'blank', requiresAuth: true }
  },
  {
    path: '/merchant',
    component: MerchantLayout,
    meta: { requiresAuth: true, roles: [2, 3] },
    children: [
      { path: '', component: MerchantDashboard, meta: { title: '工作台', layout: 'merchant' } },
      { path: 'products', component: MerchantProducts, meta: { title: '商品管理', layout: 'merchant' } },
      { path: 'records', component: MerchantRecords, meta: { title: '经营记录', layout: 'merchant' } },
      { path: 'reports', component: MerchantReports, meta: { title: '经营报表', layout: 'merchant' } },
      { path: 'shop', component: MerchantShop, meta: { title: '我的店铺', layout: 'merchant' } }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, roles: [3] },
    children: [
      { path: '', component: AdminOverview, meta: { title: '后台概览', layout: 'admin' } },
      { path: 'shops', component: AdminShops, meta: { title: '商家入驻审核', layout: 'admin' } },
      { path: 'products', component: AdminProducts, meta: { title: '产品内容审核', layout: 'admin' } },
      { path: 'recommend', component: AdminRecommend, meta: { title: '推荐位管理', layout: 'admin' } },
      { path: 'users', component: AdminUsers, meta: { title: '用户管理', layout: 'admin' } },
      { path: 'dicts', component: AdminDicts, meta: { title: '字典管理', layout: 'admin' } },
      { path: 'stats', component: AdminStats, meta: { title: '平台整体统计', layout: 'admin' } }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

export default routes
