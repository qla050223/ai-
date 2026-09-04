import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Dashboard.vue'),
        meta: { title: '数据看板', icon: 'dashboard' }
      },
      // 岗位与候选人管理
      {
        path: 'position',
        name: 'PositionList',
        component: () => import('@/views/position/PositionList.vue'),
        meta: { title: '岗位 JD 管理' }
      },
      {
        path: 'position/create',
        name: 'PositionCreate',
        component: () => import('@/views/position/PositionEdit.vue'),
        meta: { title: '创建岗位' }
      },
      {
        path: 'position/:id',
        name: 'PositionDetail',
        component: () => import('@/views/position/PositionDetail.vue'),
        meta: { title: '岗位详情' }
      },
      {
        path: 'candidate',
        name: 'CandidateList',
        component: () => import('@/views/candidate/CandidateList.vue'),
        meta: { title: '候选人档案' }
      },
      {
        path: 'candidate/:id',
        name: 'CandidateDetail',
        component: () => import('@/views/candidate/CandidateDetail.vue'),
        meta: { title: '候选人详情' }
      },
      // 面试管理（核心）
      {
        path: 'interview',
        name: 'InterviewList',
        component: () => import('@/views/interview/InterviewList.vue'),
        meta: { title: '面试管理' }
      },
      {
        path: 'interview/create',
        name: 'InterviewCreate',
        component: () => import('@/views/interview/InterviewCreate.vue'),
        meta: { title: '创建面试' }
      },
      {
        path: 'interview/:id/room',
        name: 'InterviewRoom',
        component: () => import('@/views/interview/InterviewRoom.vue'),
        meta: { title: '面试房间' }
      },
      {
        path: 'interview/:id/record',
        name: 'InterviewRecord',
        component: () => import('@/views/interview/InterviewRecord.vue'),
        meta: { title: '面试记录' }
      },
      // 题库中心
      {
        path: 'question',
        name: 'QuestionBank',
        component: () => import('@/views/question/QuestionBank.vue'),
        meta: { title: '题库中心' }
      },
      {
        path: 'question/:id',
        name: 'QuestionDetail',
        component: () => import('@/views/question/QuestionDetail.vue'),
        meta: { title: '题目详情' }
      },
      // 评估报告
      {
        path: 'report',
        name: 'ReportList',
        component: () => import('@/views/report/ReportList.vue'),
        meta: { title: '评估报告' }
      },
      {
        path: 'report/:id',
        name: 'ReportDetail',
        component: () => import('@/views/report/ReportDetail.vue'),
        meta: { title: '评估报告详情' }
      },
      // 成员管理
      {
        path: 'member',
        name: 'MemberList',
        component: () => import('@/views/member/MemberList.vue'),
        meta: { title: '成员管理' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫：模拟登录态
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.public) {
    if (auth.token && to.name === 'Login') return next('/dashboard')
    return next()
  }
  if (!auth.token) return next('/login')
  next()
})

export default router
