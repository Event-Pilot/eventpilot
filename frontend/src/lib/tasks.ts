export type TaskStatus = 'ready' | 'generating' | 'review' | 'draft'

export type Task = {
  id: string
  title: string
  type: string
  status: TaskStatus
  owner: string
  updated: string
  progress: number
}

export const tasks: Task[] = [
  {
    id: 'spring-formal',
    title: '2026 春季联谊晚会',
    type: '活动策划包',
    status: 'ready',
    owner: 'Maya',
    updated: '2 小时前',
    progress: 100,
  },
  {
    id: 'fall-fundraiser',
    title: '秋季公益筹款晚会',
    type: '活动策划包',
    status: 'review',
    owner: 'Devin',
    updated: '昨天',
    progress: 70,
  },
  {
    id: 'orientation-week',
    title: '迎新周交流会',
    type: '交接文档',
    status: 'generating',
    owner: 'Sara',
    updated: '刚刚',
    progress: 40,
  },
  {
    id: 'guest-lecture',
    title: '嘉宾讲座系列',
    type: '文档复盘',
    status: 'draft',
    owner: 'Tom',
    updated: '3 天前',
    progress: 15,
  },
]

export const statusLabels: Record<TaskStatus, string> = {
  ready: '已完成',
  generating: '生成中',
  review: '待复盘',
  draft: '草稿',
}

export const statusStyles: Record<TaskStatus, string> = {
  ready: 'bg-primary/10 text-primary border-primary/20',
  generating: 'bg-accent text-accent-foreground border-primary/20',
  review: 'bg-amber-100 text-amber-700 border-amber-200',
  draft: 'bg-muted text-muted-foreground border-border',
}

export type ResultSection = {
  id: string
  title: string
  summary: string
  items: string[]
  locked?: boolean
}

export const sampleResult = {
  id: 'spring-formal',
  title: '2026 春季联谊晚会',
  type: '活动策划包',
  meta: {
    audience: '社团成员及嘉宾（约 180 人）',
    date: '2026 年 4 月 18 日',
    venue: '河畔礼堂宴会厅',
    budget: '6500 元',
  },
  sections: [
    {
      id: 'overview',
      title: '活动概览',
      summary:
        '面向成员和嘉宾的半正式晚会，通过晚宴、表彰和交流环节回顾本学年成果。',
      items: [
        '目标：增强社群连接，并表彰成员贡献',
        '主题：“星光之夜”，主色建议使用深蓝和金色',
        '流程：18:30 签到交流，19:30 晚宴，21:00 表彰环节，21:30 自由交流',
      ],
    },
    {
      id: 'timeline',
      title: '筹备时间线',
      summary: '按 8 周倒排关键节点，并明确每周负责人。',
      items: [
        '第 8 周：确认场地合同和定金安排',
        '第 6 周：确认餐饮方案和人数预估',
        '第 4 周：开启报名售票并发布宣传内容',
        '第 2 周：确认音响、布置和志愿者排班',
      ],
    },
    {
      id: 'budget',
      title: '预算拆解',
      summary: '包含主要支出、预留缓冲和预估票务收入。',
      items: [
        '场地与音响：2400 元',
        '餐饮（180 人，每人 20 元）：3600 元',
        '布置与印刷：500 元',
        '机动预算（10%）：650 元',
      ],
      locked: true,
    },
    {
      id: 'roles',
      title: '角色与职责',
      summary: '明确各小组负责人，并设置备份联系人。',
      items: [
        '总负责人：统筹进度、对接供应商并做最终确认',
        '财务组：跟踪预算、报销和票务核对',
        '后勤组：负责场地、音响、当天搭建与撤场',
        '宣传组：负责宣传节奏、社媒发布和报名跟进',
      ],
      locked: true,
    },
    {
      id: 'runsheet',
      title: '当天执行流程',
      summary: '为执行团队准备的分钟级活动流程。',
      items: [
        '16:00 搭建组到场，布置装饰和指示牌',
        '18:00 音响检查，签到台就位',
        '18:30 开放入场，交流环节开始',
        '21:00 表彰环节，随后进入自由交流',
      ],
      locked: true,
    },
    {
      id: 'checklist',
      title: '活动前检查清单',
      summary: '活动前 48 小时用于确认关键事项不遗漏。',
      items: [
        '与餐饮供应商再次确认人数',
        '打印名牌和流程卡',
        '给麦克风充电并测试播放列表',
        '向志愿者说明岗位和时间安排',
      ],
      locked: true,
    },
  ] satisfies ResultSection[],
}
