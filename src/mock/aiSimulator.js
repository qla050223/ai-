// ==================== AI 面试官模拟器 ====================
// 模拟 PRD 中 AI 自主面试的多轮对话与动态追问

const openingScript = `你好，张明远。我是 AI 面试官，今天由我与你进行本次面试。

本次面试约 30 分钟，覆盖专业技能、项目经验、逻辑思维、沟通表达等维度。过程中你可以随时思考，回答完毕后回复"好的，下一题"我将推进后续问题。

准备好了我们就开始：首先请用 1 分钟做个简短的自我介绍，重点放在你的前端技术栈与近期项目。`

const questionFlows = [
  {
    stage: 'opening',
    aiSay: openingScript,
    expectKeyword: '自我介绍' // 候选人回复后推进
  },
  {
    stage: 'q1_intro',
    aiSay: '感谢介绍。我们直接进入技术部分。\n\nVue3 的响应式是核心，请详细说明 ref 与 reactive 的区别，以及它们各自的响应式原理。什么场景下应该使用哪个？',
    questionId: 'q_001'
  },
  {
    stage: 'q1_followup',
    aiSay: '你提到 reactive 解构会丢失响应性，能否进一步说明原因？使用 toRefs 又是如何解决的？',
    questionId: 'q_001',
    isFollowUp: true
  },
  {
    stage: 'q2',
    aiSay: '理解得很清晰。接下来看你的项目：飞书文档表格的 FPS 从 30 提升到 55，请还原这次优化的完整路径——如何定位瓶颈、采取了哪些手段、如何度量结果？',
    questionId: 'q_003'
  },
  {
    stage: 'q2_followup',
    aiSay: '如果数据量再翻 10 倍，你的方案还能支撑吗？你会从哪些维度重新设计？',
    questionId: 'q_003',
    isFollowUp: true
  },
  {
    stage: 'q3',
    aiSay: '非常好。换个工程化角度：团队要从单仓库迁移到 Monorepo（pnpm workspace），你会如何规划？需要考虑哪些风险？',
    questionId: 'q_004'
  },
  {
    stage: 'closing',
    aiSay: '回答很有体系。今天的面试就到这里，我来做一个简要反馈：\n\n- Vue3 响应式：理解到位，能讲到 Proxy 依赖收集\n- 性能优化：方法论完整，有量化结果\n- 工程化：考虑到了风险与回滚，思路清晰\n\n整体表现良好，建议进入下一轮。你有什么想问我的吗？',
    isClosing: true
  }
]

// 模拟流式输出：将文本拆成 token 逐个推送
export function streamText(text, onToken, onDone, speed = 30) {
  let i = 0
  const tokens = text.match(/[\s\S](?:[\s\S])?/) ? splitToTokens(text) : [text]
  const timer = setInterval(() => {
    if (i >= tokens.length) {
      clearInterval(timer)
      onDone && onDone()
      return
    }
    onToken(tokens[i])
    i++
  }, speed)
  return timer
}

function splitToTokens(text) {
  // 按字符或词粗粒度切分，模拟流式
  const result = []
  let buf = ''
  for (const ch of text) {
    buf += ch
    if (buf.length >= 2 || /[，。！？\n]/.test(ch)) {
      result.push(buf)
      buf = ''
    }
  }
  if (buf) result.push(buf)
  return result
}

// 根据 stage 获取 AI 下一句
export function getAiReply(stage) {
  const flow = questionFlows.find(f => f.stage === stage)
  return flow ? flow.aiSay : null
}

// 模拟 AI 对候选人作答的实时评分参考（辅助模式用）
export function getAiScoreHint(candidateAnswer) {
  // 简单关键词评分
  const len = candidateAnswer.length
  let score = 60
  if (len > 80) score += 10
  if (len > 200) score += 10
  if (/Proxy|响应|依赖|性能|量化|监控|复盘|STAR|同理心/.test(candidateAnswer)) score += 8
  if (score > 95) score = 95
  const tags = []
  if (/Proxy|响应/.test(candidateAnswer)) tags.push('概念准确')
  if (/量化|结果|FPS|QPS/.test(candidateAnswer)) tags.push('有量化结果')
  if (/监控|长效|复盘/.test(candidateAnswer)) tags.push('具备体系思维')
  if (len < 50) tags.push('回答偏短')
  return { score, tags }
}

// 模拟 AI 追问建议（辅助模式）
export function getFollowUpSuggestions(currentQuestionId) {
  const map = {
    q_001: ['为什么 reactive 解构会丢失响应性？如何解决？', 'shallowRef 和 shallowReactive 的应用场景？'],
    q_003: ['如果数据量再翻 10 倍，你的方案还能支撑吗？', '如何建立性能监控的长效机制？'],
    q_004: ['如何处理跨包类型共享？', 'Monorepo 下 CI 如何提速？']
  }
  return map[currentQuestionId] || ['能再举一个具体例子吗？', '你遇到的最大挑战是什么？']
}

// 模拟维度覆盖提示
export function getDimensionCoverage(focusDimensions, askedDimensions) {
  const remaining = focusDimensions.filter(d => !askedDimensions.includes(d))
  if (remaining.length === 0) return { complete: true, message: '所有重点维度已覆盖' }
  return {
    complete: false,
    message: `尚未考察：${remaining.join('、')}`,
    remaining
  }
}

export const interviewFlows = questionFlows
export const flowStages = questionFlows.map(f => f.stage)
