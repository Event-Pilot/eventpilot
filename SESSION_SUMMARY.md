# EventPilot v0.1 — 开发总结

> 日期：2026-05-30
> 分支：ai/dev-deepseek

---

## 1. 项目定位

EventPilot 是一个面向中国国内学生组织和轻量团队的 AI 活动流程助手。核心模式：活动启动包、活动复盘包、换届交接包。

---

## 2. 当前已完成的功能

### 前端（全部中文）

| 路由 | 状态 | 说明 |
|---|---|---|
| `/` | ✅ | 中文落地页，所有文案集中在 `src/content/site.ts` |
| `/new` | ✅ | 中文任务创建表单（11 个字段 + 3 种模式选择），点击直接 POST /api/tasks，返回后跳转结果页 |
| `/tasks/[id]` | ✅ | 中文结果页，免费预览 + 锁定章节 + 兑换码解锁 + 复制 Markdown |
| `/tasks/demo` | ✅ | 纯静态演示页，无需后端，直接展示完整 demo 内容，无兑换码输入 |
| `/dashboard` | ✅ 保留 | 原始 v0 控制台，未扩展 |
| `/result/[id]` | ✅ 保留 | 原始 v0 结果页，未扩展 |

### 后端 API

| 端点 | 方法 | 说明 |
|---|---|---|
| `/api/tasks` | POST | 创建任务（status=generating），后台启动 AI 生成，立即返回 202 |
| `/api/tasks/[id]` | GET | 获取任务，locked 时 fullOutput 为 null |
| `/api/tasks/[id]/redeem` | POST | 兑换码解锁，原子事务，成功后返回 fullOutput |

### 数据库

- SQLite + Drizzle ORM
- `tasks` 表：18 列（含 preview_output、full_output、unlocked）
- `redeem_codes` 表：5 列（code、task_id、used_at 等）
- 迁移文件：`db/migrations/0000_tricky_the_leader.sql`

### CLI 工具

```bash
pnpm generate-codes              # 生成 10 个兑换码
pnpm generate-codes --count 20   # 生成 20 个
pnpm generate-codes --count 100 --output codes.txt  # 输出到文件
```

码格式：`EP-XXXX-XXXX`（排除 0、O、1、I、L）

### 安全设计

- `fullOutput` 仅在兑换码解锁后通过 API 返回
- `toPublic()` 函数集中管控 `fullOutput` 的暴露
- 前端无 `fullOutput` 预加载
- 兑换码使用和任务解锁在同一数据库事务中完成

---

## 3. 后端架构

```
db/
  index.ts        — SQLite 连接（唯一导入 better-sqlite3 的文件）
  schema.ts       — Drizzle 表定义（唯一导入 sqlite-core 的文件）
  tasks.ts        — 任务数据访问层
  redeem-codes.ts — 兑换码数据访问层

app/api/tasks/
  route.ts              — POST /api/tasks
  [id]/route.ts         — GET /api/tasks/[id]
  [id]/redeem/route.ts  — POST /api/tasks/[id]/redeem

lib/
  ai.ts           — AI 生成模块（OpenAI 兼容 API）
  tasks.ts        — 前端类型定义（ResultSection 等）
```

---

## 4. 关键技术决策

| 决策 | 选择 | 原因 |
|---|---|---|
| ORM | Drizzle | 轻量、TypeScript 原生、便于迁移到 PostgreSQL |
| 数据库 | SQLite (better-sqlite3) | v0.1 零配置，WAL 模式支持并发读 |
| AI 提供方 | OpenAI 兼容 API | 可切换 DeepSeek/Moonshot/Zhipu 等 |
| 兑换码格式 | EP-XXXX-XXXX | 28 字符集，排除歧义字符 |
| 异步生成 | 同进程 fire-and-forget | v0.1 够用，schema 已支持 queued 状态供未来升级 |
| 前端表单 | 无 `<form>` 元素 | 避免浏览器原生表单提交干扰 React 事件 |

---

## 5. 已修复的关键 Bug

1. **兑换码 + 任务解锁非原子** → 合并到单个同步事务 `redeemCodeAndUnlockTask()`
2. **AI 输出空 section 标题** → 按模式添加回退标题
3. **AI 输出空 section ID** → 按位置分配确定性 ID
4. **Demo 页无限加载** → 分离为纯静态组件 `StaticDemoTaskResult`
5. **表单原生 GET 提交** → 移除 `<form>`，改用 `<div>` + `type="button" onClick`
6. **非 HTTPS 下复制崩溃** → `copyToClipboard()` 添加 `execCommand('copy')` 回退
7. **同步生成导致 /new 长时间等待** → 改为异步生成 + 前端轮询

---

## 6. 环境变量

| 变量 | 默认值 | 说明 |
|---|---|---|
| `DATABASE_URL` | `data/eventpilot.db` | SQLite 文件路径 |
| `AI_API_KEY` | （必填） | AI 提供方 API Key |
| `AI_BASE_URL` | `https://api.openai.com/v1` | OpenAI 兼容端点 |
| `AI_MODEL` | `gpt-4o-mini` | 模型名称 |

---

## 7. 开发命令

```bash
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm generate-codes   # 生成兑换码
pnpm db:generate      # 生成数据库迁移
pnpm db:migrate       # 执行数据库迁移
npx tsc --noEmit      # TypeScript 类型检查
```

---

## 8. v0.1 不包含的功能

- 用户认证 / 登录
- 支付集成
- 文件上传
- 多租户 / 工作区
- 任务列表 / 搜索
- 队列 / 后台 Worker
- Redis / BullMQ
- 邮件 / 通知

---
