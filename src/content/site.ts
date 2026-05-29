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
      'EventPilot 帮助学生组织、社团和小型团队生成活动启动包、复盘报告和换届交接文档，几分钟内完成从想法到可执行方案的整理。',
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
      text: 'AI 活动流程助手',
    },
    heading: '把你的活动想法，变成可执行的流程文档',
    body: 'EventPilot 根据你提供的信息，自动整理时间线、预算、分工和清单。你专注活动本身，文档的事交给我们。',
    primaryCta: {
      label: '开始生成',
      href: '/dashboard/new',
      icon: 'ArrowRight' as IconName,
    },
    secondaryCta: {
      label: '查看示例',
      href: '/dashboard',
    },
    footnote: '免费使用 · 无需注册 · 为学生组织和轻量团队设计',
    previewSteps: [
      {
        icon: 'FileText' as IconName,
        label: '活动启动包',
        desc: '时间线、预算、分工、清单',
      },
      {
        icon: 'CheckCircle2' as IconName,
        label: '活动复盘包',
        desc: '数据整理、问题标记、改进建议',
      },
      {
        icon: 'Send' as IconName,
        label: '换届交接包',
        desc: '流程文档、注意事项、一键移交',
      },
    ],
  },

  // ---- features section --------------------------------------------------

  features: {
    label: '覆盖活动全流程',
    heading: '从想法到执行，再到交接，一步不漏',
    body: 'EventPilot 把活动信息整理成结构化文档，减少重复劳动，降低团队沟通成本。',
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
    heading: '四步完成活动准备',
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
    heading: '一套工具，适配各种活动',
    body: '不管是十几个人的社团活动，还是跨校联合项目，EventPilot 都能适配你的工作节奏。',
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
    heading: '下一个活动，从现在开始准备',
    body: '免费生成你的第一份活动启动包。团队需要更多功能时再升级。',
    primaryCta: {
      label: '开始生成',
      href: '/dashboard/new',
      icon: 'ArrowRight' as IconName,
    },
    secondaryCta: {
      label: '查看示例',
      href: '/dashboard',
    },
  },

  // ---- site footer -------------------------------------------------------

  footer: {
    tagline: '为学生组织和小型团队打造的 AI 活动流程助手。',
    columns: [
      {
        title: '产品',
        links: ['功能', '使用流程', '模板', '定价', '更新日志'],
      },
      {
        title: '场景',
        links: ['学生组织', '社团活动', '轻量团队', '活动策划'],
      },
      {
        title: '关于',
        links: ['关于我们', '博客', '加入我们', '联系我们'],
      },
      {
        title: '资源',
        links: ['文档', '帮助中心', '隐私政策', '服务条款'],
      },
    ],
    copyright: `© ${new Date().getFullYear()} EventPilot`,
    bottom: '为用心做活动的团队服务。',
  },
} as const
