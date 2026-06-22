import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: '仪表盘', icon: '📊' },
  },
  {
    path: '/workflow',
    name: 'workflow',
    component: () => import('@/views/WorkflowView.vue'),
    meta: { title: '装修流程', icon: '📖' },
  },
  {
    path: '/workflow/:stageId',
    name: 'stage-detail',
    component: () => import('@/views/StageDetailView.vue'),
    meta: { title: '阶段详情', icon: '📖' },
  },
  {
    path: '/budget',
    name: 'budget',
    component: () => import('@/views/BudgetView.vue'),
    meta: { title: '预算管理', icon: '💰' },
  },
  {
    path: '/materials',
    name: 'materials',
    component: () => import('@/views/MaterialsView.vue'),
    meta: { title: '材料清单', icon: '📦' },
  },
  {
    path: '/workers',
    name: 'workers',
    component: () => import('@/views/WorkersView.vue'),
    meta: { title: '工人管理', icon: '👷' },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
