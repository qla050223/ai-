import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCandidateAuthStore } from '@/stores/candidate'

const routes = [
  // ==================== 企业端（B 端）====================
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { public: true, portal: 'enterprise' }
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Dashboard.vue'), meta: { title: '数据看板' } },
      { path: 'position', name: 'PositionList', component: () => import('@/views/position/PositionList.vue'), meta: { title: '岗位 JD 管理' } },
      { path: 'position/create', name: 'PositionCreate', component: () => import('@/views/position/PositionEdit.vue'), meta: { title: '创建岗位' } },
      { path: 'position/:id', name: 'PositionDetail', component: () => import('@/views/position/PositionDetail.vue'), meta: { title: '岗位详情' } },
      { path: 'candidate', name: 'CandidateList', component: () => import('@/views/candidate/CandidateList.vue'), meta: { title: '候选人档案' } },
      { path: 'candidate/:id', name: 'CandidateDetail', component: () => import('@/views/candidate/CandidateDetail.vue'), meta: { title: '候选人详情' } },
      { path: 'interview', name: 'InterviewList', component: () => import('@/views/interview/InterviewList.vue'), meta: { title: '面试管理' } },
      { path: 'interview/create', name: 'InterviewCreate', component: () => import('@/views/interview/InterviewCreate.vue'), meta: { title: '创建面试' } },
      { path: 'interview/:id/room', name: 'InterviewRoom', component: () => import('@/views/interview/InterviewRoom.vue'), meta: { title: '面试房间' } },
      { path: 'interview/:id/record', name: 'InterviewRecord', component: () => import('@/views/interview/InterviewRecord.vue'), meta: { title: '面试记录' } },
      { path: 'question', name: 'QuestionBank', component: () => import('@/views/question/QuestionBank.vue'), meta: { title: '题库中心' } },
      { path: 'question/:id', name: 'QuestionDetail', component: () => import('@/views/question/QuestionDetail.vue'), meta: { title: '题目详情' } },
      { path: 'report', name: 'ReportList', component: () => import('@/views/report/ReportList.vue'), meta: { title: '评估报告' } },
      { path: 'report/:id', name: 'ReportDetail', component: () => import('@/views/report/ReportDetail.vue'), meta: { title: '评估报告详情' } },
      { path: 'member', name: 'MemberList', component: () => import('@/views/member/MemberList.vue'), meta: { title: '成员管理' } }
    ]
  },

  // ==================== 求职者端（C 端）====================
  // 公共入口：注册 / 登录
  {
    path: '/c/login',
    name: 'CandidateLogin',
    component: () => import('@/views/c-portal/CandidateLogin.vue'),
    meta: { public: true, portal: 'candidate' }
  },
  {
    path: '/c/register',
    name: 'CandidateRegister',
    component: () => import('@/views/c-portal/CandidateRegister.vue'),
    meta: { public: true, portal: 'candidate' }
  },
  // 异步面试：Token 免登录入口（整套页面公共，靠 asyncInterviewStore 校验状态保护）
  {
    path: '/c/async/:token',
    name: 'AsyncEntry',
    component: () => import('@/views/c-portal/AsyncEntry.vue'),
    meta: { public: true, portal: 'candidate', async: true }
  },
  {
    path: '/c/async/prep',
    name: 'AsyncPrep',
    component: () => import('@/views/c-portal/AsyncPrep.vue'),
    meta: { public: true, portal: 'candidate', async: true }
  },
  {
    path: '/c/async/room',
    name: 'AsyncRoom',
    component: () => import('@/views/c-portal/AsyncRoom.vue'),
    meta: { public: true, portal: 'candidate', async: true }
  },
  {
    path: '/c/async/thanks',
    name: 'AsyncThanks',
    component: () => import('@/views/c-portal/AsyncThanks.vue'),
    meta: { public: true, portal: 'candidate', async: true }
  },
  // 求职者端主应用（需登录态）
  {
    path: '/c',
    component: () => import('@/layouts/CandidateLayout.vue'),
    redirect: '/c/mock',
    children: [
      // 模拟面试（主动入口）
      { path: 'mock', name: 'MockHome', component: () => import('@/views/c-portal/MockHome.vue'), meta: { title: '模拟面试', portal: 'candidate' } },
      { path: 'mock/config/:positionId', name: 'MockConfig', component: () => import('@/views/c-portal/MockConfig.vue'), meta: { title: '练习配置', portal: 'candidate' } },
      { path: 'mock/room/:interviewId', name: 'MockRoom', component: () => import('@/views/c-portal/MockRoom.vue'), meta: { title: 'AI 模拟面试', portal: 'candidate' } },
      { path: 'mock/result/:interviewId', name: 'MockResult', component: () => import('@/views/c-portal/MockResult.vue'), meta: { title: '能力反馈', portal: 'candidate' } },
      // 我的面试
      { path: 'my', name: 'MyInterviews', component: () => import('@/views/c-portal/MyInterviews.vue'), meta: { title: '我的面试', portal: 'candidate' } },
      { path: 'my/:id', name: 'InterviewReview', component: () => import('@/views/c-portal/InterviewReview.vue'), meta: { title: '面试记录', portal: 'candidate' } },
      // 能力档案
      { path: 'ability', name: 'AbilityProfile', component: () => import('@/views/c-portal/AbilityProfile.vue'), meta: { title: '能力档案', portal: 'candidate' } },
      // 设置与隐私
      { path: 'settings', name: 'CandidateSettings', component: () => import('@/views/c-portal/CandidateSettings.vue'), meta: { title: '设置与隐私', portal: 'candidate' } }
    ]
  },

  // 根路径兜底
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})

// 路由守卫：企业端与求职者端双体系
router.beforeEach((to, from, next) => {
  // 公共页面直接放行
  if (to.meta.public) {
    // 已登录访问登录页则跳转对应首页
    if (to.name === 'CandidateLogin' || to.name === 'CandidateRegister') {
      const cAuth = useCandidateAuthStore()
      if (cAuth.isLoggedIn) return next('/c/mock')
    }
    return next()
  }
  // 求职者端 protected 路由
  if (to.meta.portal === 'candidate') {
    const cAuth = useCandidateAuthStore()
    if (!cAuth.isLoggedIn) {
      return next({ name: 'CandidateLogin', query: { redirect: to.fullPath } })
    }
    return next()
  }
  // 企业端 protected 路由
  const auth = useAuthStore()
  if (!auth.token) return next('/login')
  next()
})

export default router
