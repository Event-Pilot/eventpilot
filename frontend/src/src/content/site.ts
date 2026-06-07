// ---------------------------------------------------------------------------
// EventPilot — 产品文案（简体中文 v0.1）
//
// This file is the single source of truth for every user-facing string on the
// public landing page.  Components import what they need; they do NOT
// hardcode copy.
//
// Icon references use string keys (IconName) rather than React components so
// the content layer stays serialisable and framework-agnostic.  Each
// component that renders an icon keeps its own lightweight
// `Record<IconName, LucideIcon>` map.
// ---------------------------------------------------------------------------

export type IconName =
  | 'FileText'
  | 'CheckCircle2'
  | 'Send'
  | 'Sparkles'
  | 'ArrowRight'
  | 'FileStack'
  | 'ShieldCheck'
  | 'Clock'
  | 'Users'
  | 'Wand2'
  | 'GraduationCap'
  | 'PartyPopper'
  | 'Briefcase'
  | 'HeartHandshake'

// ---- shared link shape ---------------------------------------------------

export interface CtaLink {
  label: string
  href: string
  icon?: IconName
}

// ---- top-level config ----------------------------------------------------

export const siteConfig = {
  name: 'EventPilot',

  // ---- <head> metadata (app/layout.tsx) ----------------------------------

  metadata: {
    title: 'EventPilot — AI 活动流程助手',
    description:
      'EventPilot 帮助学生组织、社团和活动团队生成活动启动包、复盘报告和交接文档，把零散信息整理成可执行方案。',
  },

  // ---- site header -------------------------------------------------------

  header: {
    navItems: [
      { label: '功能', href: '#features' },
      { label: '流程', href: '#how-it-works' },
      { label: '场景', href: '#use-cases' },
      { label: '定价', href: '#pricing' },
    ],
    signInLabel: '登录',
    startFreeLabel: '免费试用',
  },

  // ---- hero section ------------------------------------------------------

  hero: {
    badge: {
      icon: 'Sparkles' as IconName,
      text: 'EventPilot 活动飞行控制台',
    },
    heading: '从活动信息，到完整执行方案',
    body: '输入活动背景、规模、预算和限制条件，EventPilot 会把它们编排成时间线、预算、分工、当天流程和检查清单。',
    primaryCta: {
      label: '开始生成',
      href: '/new',
      icon: 'ArrowRight' as IconName,
    },
    secondaryCta: {
      label: '查看示例',
      href: '/tasks/demo',
    },
    footnote: '一条清晰航线：输入信息 → AI 编排 → 执行方案',
    mock: {
      windowLabel: 'EventPilot 活动飞行台',
      previewBadge: '活动执行方案生成中',
      title: '2026 春季社团文化节',
      meta: '计算机协会 · 180 人 · 多功能厅 · 3000-5000 元',
      status: 'AI 编排中',
      routeLabel: '生成航线',
      route: ['输入活动信息', 'AI 整理逻辑', '生成执行方案'],
      inputTitle: '活动信息输入',
      inputRows: [
        { label: '活动目标', value: '展示社团成果，吸引新成员' },
        { label: '时间地点', value: '4 月中旬 · 多功能厅' },
        { label: '资源限制', value: '预算 3000-5000 元，志愿者 18 人' },
      ],
      materialTitle: '已读取材料',
      materials: ['会议记录', '往届策划案', '场地规则'],
      aiTitle: 'AI 编排引擎',
      aiSubtitle: '正在把零散信息转换为可执行结构',
      aiSignals: ['目标', '时间', '预算', '人员', '风险'],
      outputTitle: '完整执行方案',
      readyLabel: '已生成',
      outputs: [
        { title: '筹备时间线', detail: '8 周倒排 · 关键节点 · 负责人' },
        { title: '预算与物资', detail: '支出拆解 · 缓冲金 · 采购清单' },
        { title: '人员分工', detail: '岗位职责 · 备选联系人 · 到岗时间' },
        { title: '当天流程', detail: '分钟级流程 · 签到 · 撤场' },
      ],
      deckTitle: '执行包已生成',
      deckItems: ['活动概览', '检查清单', '风险提醒'],
      summary: [
        { value: '6', label: '核心章节' },
        { value: '48h', label: '检查窗口' },
        { value: '1', label: '可分享链接' },
      ],
    },
    previewSteps: [
      {
        icon: 'FileText' as IconName,
        label: '活动启动包',
        desc: '时间线、预算、分工、物资清单',
      },
      {
        icon: 'CheckCircle2' as IconName,
        label: '活动复盘包',
        desc: '数据整理、问题定位、改进建议',
      },
      {
        icon: 'Send' as IconName,
        label: '换届交接包',
        desc: '流程沉淀、风险提醒、经验移交',
      },
    ],
  },

  // ---- features section --------------------------------------------------

  features: {
    label: '活动文档工作台',
    heading: '把策划、执行、复盘放进同一套流程',
    body: 'EventPilot 不替你做决定，而是把关键事项整理清楚，让团队更快对齐目标、分工和交付物。',
    summary: [
      { value: '6', label: '核心文档模块' },
      { value: '20-60 秒', label: '生成预览初稿' },
      { value: '1 个链接', label: '团队共享结果' },
    ],
    preview: {
      title: '活动执行包结构',
      subtitle: '从概览到检查清单，输出可以直接进入团队协作。',
      tabs: ['启动包', '复盘包', '交接包'],
      timeline: ['活动概览', '筹备时间线', '预算与物资', '人员分工', '当天流程', '检查清单'],
    },
    items: [
      {
        icon: 'FileStack' as IconName,
        title: '活动启动包',
        desc: '输入活动基本信息，自动生成时间线、预算框架、角色分工和待办清单，拿来就能用。',
      },
      {
        icon: 'ShieldCheck' as IconName,
        title: '活动复盘包',
        desc: '整理活动数据、参与反馈和遇到的问题，生成结构化复盘报告，下次做得更好。',
      },
      {
        icon: 'Send' as IconName,
        title: '换届交接包',
        desc: '把活动经验、流程要点和注意事项打包成清晰文档，下一届负责人轻松接手。',
      },
      {
        icon: 'Clock' as IconName,
        title: '分钟级出稿',
        desc: '不用从空白文档开始。填一个简短表单，几十秒就能拿到完整初稿，再按需调整。',
      },
      {
        icon: 'Users' as IconName,
        title: '团队协作友好',
        desc: '分工明确、信息同步，一个链接就能让所有人对齐进度，不用反复拉群沟通。',
      },
      {
        icon: 'Wand2' as IconName,
        title: '模板越用越顺手',
        desc: '社团招新、讲座、比赛等常用场景模板，用得越多越适配你的组织习惯。',
      },
    ],
  },

  // ---- how-it-works section ----------------------------------------------

  howItWorks: {
    label: '使用流程',
    heading: '从输入信息到交付文档，流程保持清晰',
    body: '让活动从想法、草案、执行到归档都有明确位置，减少反复沟通和遗漏。',
    routeLabel: '推荐流程',
    steps: [
      {
        step: '01',
        title: '描述你的活动',
        desc: '填写活动类型、规模、日期和目标。EventPilot 只需要这些信息就能开始工作。',
      },
      {
        step: '02',
        title: '生成活动包',
        desc: '自动生成包含时间线、预算、分工和清单的结构化文档，可直接编辑调整。',
      },
      {
        step: '03',
        title: '检查与优化',
        desc: 'EventPilot 帮你检查文档完整性，标记遗漏项和潜在风险，一键采纳修改建议。',
      },
      {
        step: '04',
        title: '交接与归档',
        desc: '导出干净文档，分享给指导老师、场地方或下一届负责人，信息不丢失。',
      },
    ],
  },

  // ---- use-cases section -------------------------------------------------

  useCases: {
    label: '适用场景',
    heading: '适合需要快速成稿的活动团队',
    body: '不管是十几个人的社团活动，还是跨部门的企业活动，EventPilot 都能把工作拆成更清楚的文档。',
    pipeline: ['策划', '执行', '归档'],
    highlightFlow: ['活动输入', '结构化生成', '团队交接'],
    items: [
      {
        icon: 'GraduationCap' as IconName,
        title: '学生组织',
        desc: '招新、换届、例会、内部培训，活动流程可复用，把经验留在组织里而不是个人手里。',
      },
      {
        icon: 'PartyPopper' as IconName,
        title: '社团与联谊',
        desc: '晚会、路演、主题聚会，从策划到执行有据可依，每个环节都有人负责。',
      },
      {
        icon: 'HeartHandshake' as IconName,
        title: '志愿与公益',
        desc: '协调人员、设定目标、整理活动报告，让公益项目的组织工作更规范。',
      },
      {
        icon: 'Briefcase' as IconName,
        title: '轻量团队活动',
        desc: '工作坊、讲座、发布会、小型展览，快速准备，专业呈现，不凑合。',
      },
    ],
  },

  // ---- CTA / pricing section ---------------------------------------------

  cta: {
    heading: '下一场活动，从一份清楚的文档开始',
    body: '登录后创建任务，先查看预览内容，再按需解锁完整活动包。',
    highlights: ['登录后生成', '公开预览可分享', '完整文档可解锁'],
    primaryCta: {
      label: '开始生成',
      href: '/new',
      icon: 'ArrowRight' as IconName,
    },
    secondaryCta: {
      label: '查看示例',
      href: '/tasks/demo',
    },
  },

  // ---- site footer -------------------------------------------------------

  footer: {
    tagline: '为学生组织和小型团队打造的 AI 活动流程助手。',
    columns: [
      {
        title: '产品',
        links: [
          { label: '功能', href: '/#features' },
          { label: '使用流程', href: '/#how-it-works' },
          { label: '查看示例', href: '/tasks/demo' },
          { label: '定价', href: '/#pricing' },
        ],
      },
      {
        title: '场景',
        links: [
          { label: '学生组织', href: '/#use-cases' },
          { label: '社团活动', href: '/#use-cases' },
          { label: '企业活动', href: '/#use-cases' },
          { label: '活动策划', href: '/new' },
        ],
      },
      {
        title: '关于',
        links: [
          { label: '关于我们', href: '/#features' },
          { label: '联系我们', href: '/#pricing' },
        ],
      },
      {
        title: '资源',
        links: [
          { label: '帮助中心', href: '/#how-it-works' },
          { label: '隐私政策', href: '/#pricing' },
          { label: '服务条款', href: '/#pricing' },
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} EventPilot`,
    bottom: '为用心做活动的团队服务。',
  },
} as const
