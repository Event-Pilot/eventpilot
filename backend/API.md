# EventPilot 后端 API 文档

本文档面向前端开发者，覆盖当前 Spring Boot 后端已经实现的全部 HTTP API。

后端本地开发 Base URL：

```text
http://localhost:8080
```

当前后端使用 JSON 请求和 JSON 响应。除特别说明外，请求 Header 建议包含：

```http
Content-Type: application/json
Accept: application/json
```

## 认证总览

当前认证使用 Spring Security + JWT。注册和登录成功后，后端会在响应体的 `token` 字段返回 JWT：

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User",
    "createdAt": "2026-06-03T09:26:13.000Z",
    "updatedAt": "2026-06-03T09:26:13.000Z"
  }
}
```

前端可以从 `response.data.token` 读取 token。简单前端项目可以先存入 `localStorage`：

```ts
localStorage.setItem("eventpilot_token", response.data.token)
```

后续访问需要登录的接口时，在请求 Header 中携带：

```http
Authorization: Bearer <token>
```

注意格式：

- `Authorization` 是 Header 名。
- `Bearer` 后面必须有一个空格。
- `<token>` 替换为注册或登录接口返回的 JWT 字符串。

示例：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

目前 `GET /api/auth/me` 和 `POST /api/tasks` 需要登录。`GET /api/tasks/{id}` 查询任务和 `POST /api/tasks/{id}/redeem` 兑换码解锁暂时保持匿名访问。

## 通用错误格式

后端统一返回 JSON 错误。因为保留旧任务接口兼容性，错误响应存在两种合法形态。

只有 `error`：

```json
{
  "error": "活动名称不能为空"
}
```

包含 `error` 和 `message`：

```json
{
  "error": "invalid_request",
  "message": "请求体必须是有效的 JSON"
}
```

前端处理建议：

```ts
const message = error.response?.data?.message || error.response?.data?.error || "请求失败"
```

## 数据结构

### UserResponse

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User",
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:26:13.000Z"
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | number | 用户 ID |
| `email` | string | 用户邮箱，后端会统一转成小写 |
| `name` | string \| null | 用户名称，空字符串会被保存为 `null` |
| `createdAt` | string | ISO UTC 时间，形如 `toISOString()` |
| `updatedAt` | string | ISO UTC 时间，形如 `toISOString()` |

### AuthResponse

```json
{
  "token": "jwt-token",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User",
    "createdAt": "2026-06-03T09:26:13.000Z",
    "updatedAt": "2026-06-03T09:26:13.000Z"
  }
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `token` | string | JWT token |
| `user` | UserResponse | 当前登录用户信息 |

### TaskPublicResponse

```json
{
  "id": "P8jkjYJN",
  "mode": "startup",
  "activityName": "春季团建",
  "organizationName": "EventPilot",
  "activityType": "团建",
  "expectedParticipants": 30,
  "dateOrPeriod": "2026-06",
  "location": "上海",
  "budgetRange": "10000-20000",
  "targetAudience": "公司员工",
  "extraContext": "希望轻松有趣",
  "pastedMaterials": "补充材料",
  "status": "ready",
  "previewOutput": [
    {
      "id": "overview",
      "title": "活动概览",
      "summary": "活动整体方案摘要",
      "items": ["目标", "亮点"]
    }
  ],
  "fullOutput": null,
  "unlocked": false,
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:27:05.000Z"
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 任务 ID |
| `mode` | string | 生成模式，可能值：`startup` / `review` / `handoff` |
| `activityName` | string | 活动名称 |
| `organizationName` | string | 组织名称 |
| `activityType` | string \| null | 活动类型 |
| `expectedParticipants` | number \| null | 预计参与人数 |
| `dateOrPeriod` | string \| null | 日期或周期 |
| `location` | string \| null | 地点 |
| `budgetRange` | string \| null | 预算范围 |
| `targetAudience` | string \| null | 目标人群 |
| `extraContext` | string \| null | 额外上下文 |
| `pastedMaterials` | string \| null | 粘贴的背景资料 |
| `status` | string | 任务状态，可能值：`generating` / `ready` / `error` |
| `previewOutput` | ResultSection[] \| null | 预览内容。生成中或失败时可能为 `null` |
| `fullOutput` | ResultSection[] \| null | 完整内容。未解锁时固定为 `null` |
| `unlocked` | boolean | 是否已兑换码解锁 |
| `createdAt` | string | ISO UTC 时间，形如 `toISOString()` |
| `updatedAt` | string | ISO UTC 时间，形如 `toISOString()` |

### ResultSection

```json
{
  "id": "overview",
  "title": "活动概览",
  "summary": "活动整体方案摘要",
  "items": ["目标", "亮点"]
}
```

字段说明：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 章节 ID |
| `title` | string | 章节标题 |
| `summary` | string | 章节摘要 |
| `items` | string[] | 章节条目 |

## 接口清单

| 接口名称 | 方法 | URL | 是否需要登录 |
| --- | --- | --- | --- |
| 注册 | POST | `/api/auth/register` | 否 |
| 登录 | POST | `/api/auth/login` | 否 |
| 获取当前用户 | GET | `/api/auth/me` | 是 |
| 创建任务 | POST | `/api/tasks` | 是 |
| 查询任务 | GET | `/api/tasks/{id}` | 否 |
| 兑换码解锁任务 | POST | `/api/tasks/{id}/redeem` | 否 |

## 注册

创建新用户，并返回 JWT token 和用户信息。

| 项目 | 内容 |
| --- | --- |
| 请求方法 | `POST` |
| URL | `/api/auth/register` |
| 是否需要登录 | 否 |
| 成功状态码 | `200 OK` |

请求 Header：

```http
Content-Type: application/json
Accept: application/json
```

请求 Body：

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User"
}
```

请求字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `email` | string | 是 | 邮箱。后端会 trim 并转小写。格式必须类似 `name@example.com` |
| `password` | string | 是 | 密码。不能为空或全空白。后端使用 BCrypt 加密后保存到 `password_hash` |
| `name` | string | 否 | 用户名称。空字符串会按 `null` 处理 |

成功响应示例：

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User",
    "createdAt": "2026-06-03T09:26:13.000Z",
    "updatedAt": "2026-06-03T09:26:13.000Z"
  }
}
```

失败响应示例：

`400 Bad Request`，请求体为空：

```json
{
  "error": "invalid_request",
  "message": "请求体不能为空"
}
```

`400 Bad Request`，邮箱为空：

```json
{
  "error": "invalid_request",
  "message": "邮箱不能为空"
}
```

`400 Bad Request`，邮箱格式不正确：

```json
{
  "error": "invalid_request",
  "message": "邮箱格式不正确"
}
```

`400 Bad Request`，密码为空：

```json
{
  "error": "invalid_request",
  "message": "密码不能为空"
}
```

`409 Conflict`，邮箱已注册：

```json
{
  "error": "user_exists",
  "message": "邮箱已注册"
}
```

`400 Bad Request`，JSON 格式错误：

```json
{
  "error": "invalid_request",
  "message": "请求体必须是有效的 JSON"
}
```

前端调用注意事项：

- 后端会在注册成功后返回 `token`；前端可以按产品流程选择直接保存为已登录，或跳转登录页让用户重新登录。
- 不要在前端保存明文密码。
- 如果 `409 user_exists`，前端可以提示用户改为登录。

curl 示例：

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"User"}'
```

Axios 示例：

```ts
import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
})

const response = await api.post("/api/auth/register", {
  email: "user@example.com",
  password: "password123",
  name: "User",
})

// 当前前端注册成功后跳转登录页；如产品改为注册即登录，也可以保存 response.data.token。
```

## 登录

使用邮箱和密码登录，并返回 JWT token 和用户信息。

| 项目 | 内容 |
| --- | --- |
| 请求方法 | `POST` |
| URL | `/api/auth/login` |
| 是否需要登录 | 否 |
| 成功状态码 | `200 OK` |

请求 Header：

```http
Content-Type: application/json
Accept: application/json
```

请求 Body：

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

请求字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `email` | string | 是 | 邮箱。后端会 trim 并转小写 |
| `password` | string | 是 | 密码。不能为空或全空白 |

成功响应示例：

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User",
    "createdAt": "2026-06-03T09:26:13.000Z",
    "updatedAt": "2026-06-03T09:26:13.000Z"
  }
}
```

失败响应示例：

`400 Bad Request`，邮箱为空：

```json
{
  "error": "invalid_request",
  "message": "邮箱不能为空"
}
```

`400 Bad Request`，密码为空：

```json
{
  "error": "invalid_request",
  "message": "密码不能为空"
}
```

`401 Unauthorized`，邮箱或密码错误：

```json
{
  "error": "invalid_credentials",
  "message": "邮箱或密码错误"
}
```

前端调用注意事项：

- 登录成功后从 `response.data.token` 取 token。
- 后续需要登录的接口使用 `Authorization: Bearer <token>`。
- 当前 token 过期时间由后端配置 `JWT_EXPIRATION_SECONDS` 控制，开发默认值为 86400 秒。

curl 示例：

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

Axios 示例：

```ts
const response = await api.post("/api/auth/login", {
  email: "user@example.com",
  password: "password123",
})

localStorage.setItem("eventpilot_token", response.data.token)
```

## 获取当前用户

通过 JWT token 获取当前登录用户信息。

| 项目 | 内容 |
| --- | --- |
| 请求方法 | `GET` |
| URL | `/api/auth/me` |
| 是否需要登录 | 是 |
| 成功状态码 | `200 OK` |

请求 Header：

```http
Authorization: Bearer <token>
Accept: application/json
```

请求 Body：无

成功响应示例：

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User",
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:26:13.000Z"
}
```

失败响应示例：

`401 Unauthorized`，未携带 token：

```json
{
  "error": "unauthorized",
  "message": "请先登录"
}
```

`401 Unauthorized`，token 无效或过期：

```json
{
  "error": "invalid_token",
  "message": "登录状态已失效，请重新登录"
}
```

前端调用注意事项：

- Header 必须是 `Authorization: Bearer <token>`。
- 如果返回 `401`，前端应清理本地 token 并引导用户重新登录。
- `GET /api/auth/me` 和 `POST /api/tasks` 当前强制要求登录。

curl 示例：

```bash
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Axios 示例：

```ts
const token = localStorage.getItem("eventpilot_token")

const response = await api.get("/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
```

Axios 拦截器示例：

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eventpilot_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## 创建任务

创建活动生成任务。后端保存任务后会立即返回 `generating`，AI 生成在后台异步执行。

| 项目 | 内容 |
| --- | --- |
| 请求方法 | `POST` |
| URL | `/api/tasks` |
| 是否需要登录 | 是 |
| 成功状态码 | `202 Accepted` |

请求 Header：

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <token>
```

请求 Body：

```json
{
  "mode": "startup",
  "activityName": "春季团建",
  "organizationName": "EventPilot",
  "activityType": "团建",
  "expectedParticipants": 30,
  "dateOrPeriod": "2026-06",
  "location": "上海",
  "budgetRange": "10000-20000",
  "targetAudience": "公司员工",
  "extraContext": "希望轻松有趣",
  "pastedMaterials": "补充材料"
}
```

请求字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `mode` | string | 是 | 生成模式。必须是 `startup` / `review` / `handoff` |
| `activityName` | string | 是 | 活动名称，不能为空 |
| `organizationName` | string | 是 | 组织名称，不能为空 |
| `activityType` | string | 否 | 活动类型 |
| `expectedParticipants` | number \| string | 否 | 预计参与人数。后端会解析为正整数；无效、空值或小于等于 0 会保存为 `null` |
| `dateOrPeriod` | string | 否 | 日期或周期 |
| `location` | string | 否 | 地点 |
| `budgetRange` | string | 否 | 预算范围 |
| `targetAudience` | string | 否 | 目标人群 |
| `extraContext` | string | 否 | 额外上下文 |
| `pastedMaterials` | string | 否 | 粘贴的背景资料。后端最多保留 20000 字符 |

成功响应示例：

```json
{
  "id": "P8jkjYJN",
  "status": "generating"
}
```

为什么返回 `generating`：

- 创建任务接口只负责保存任务并启动后台 AI 生成。
- AI 生成需要时间，所以接口立即返回 `202 Accepted`。
- 前端应使用返回的 `id` 轮询 `GET /api/tasks/{id}`。

失败响应示例：

`400 Bad Request`，请求体为空：

```json
{
  "error": "请求体不能为空"
}
```

`400 Bad Request`，活动名称为空：

```json
{
  "error": "活动名称不能为空"
}
```

`400 Bad Request`，组织名称为空：

```json
{
  "error": "组织名称不能为空"
}
```

`400 Bad Request`，生成模式非法：

```json
{
  "error": "生成模式必须是 startup、review 或 handoff"
}
```

`400 Bad Request`，JSON 格式错误：

```json
{
  "error": "请求体必须是有效的 JSON"
}
```

`401 Unauthorized`，未携带 token：

```json
{
  "error": "unauthorized",
  "message": "请先登录"
}
```

`401 Unauthorized`，token 无效或过期：

```json
{
  "error": "invalid_token",
  "message": "登录状态已失效，请重新登录"
}
```

`500 Internal Server Error`：

```json
{
  "error": "创建任务失败，请稍后重试"
}
```

前端调用注意事项：

- 创建任务需要登录，必须携带 `Authorization: Bearer <token>`。
- 如果返回 `401`，前端应清理本地 token 并引导用户登录。
- 创建成功后保存 `id`，跳转结果页或开始轮询。
- `status` 初始一定是 `generating`。

curl 示例：

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mode": "startup",
    "activityName": "春季团建",
    "organizationName": "EventPilot",
    "activityType": "团建",
    "expectedParticipants": 30,
    "dateOrPeriod": "2026-06",
    "location": "上海",
    "budgetRange": "10000-20000",
    "targetAudience": "公司员工",
    "extraContext": "希望轻松有趣",
    "pastedMaterials": "补充材料"
  }'
```

Axios 示例：

```ts
const response = await api.post("/api/tasks", {
  mode: "startup",
  activityName: "春季团建",
  organizationName: "EventPilot",
  activityType: "团建",
  expectedParticipants: 30,
  dateOrPeriod: "2026-06",
  location: "上海",
  budgetRange: "10000-20000",
  targetAudience: "公司员工",
  extraContext: "希望轻松有趣",
  pastedMaterials: "补充材料",
})

const { id, status } = response.data
```

## 查询任务

查询任务状态和生成结果。前端创建任务后应轮询该接口。

| 项目 | 内容 |
| --- | --- |
| 请求方法 | `GET` |
| URL | `/api/tasks/{id}` |
| 是否需要登录 | 否 |
| 成功状态码 | `200 OK` |

请求 Header：

```http
Accept: application/json
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 创建任务接口返回的任务 ID |

成功响应示例，生成中：

```json
{
  "id": "P8jkjYJN",
  "mode": "startup",
  "activityName": "春季团建",
  "organizationName": "EventPilot",
  "activityType": "团建",
  "expectedParticipants": 30,
  "dateOrPeriod": "2026-06",
  "location": "上海",
  "budgetRange": "10000-20000",
  "targetAudience": "公司员工",
  "extraContext": "希望轻松有趣",
  "pastedMaterials": "补充材料",
  "status": "generating",
  "previewOutput": null,
  "fullOutput": null,
  "unlocked": false,
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:26:13.000Z"
}
```

成功响应示例，生成完成但未解锁：

```json
{
  "id": "P8jkjYJN",
  "mode": "startup",
  "activityName": "春季团建",
  "organizationName": "EventPilot",
  "activityType": "团建",
  "expectedParticipants": 30,
  "dateOrPeriod": "2026-06",
  "location": "上海",
  "budgetRange": "10000-20000",
  "targetAudience": "公司员工",
  "extraContext": "希望轻松有趣",
  "pastedMaterials": "补充材料",
  "status": "ready",
  "previewOutput": [
    {
      "id": "overview",
      "title": "活动概览",
      "summary": "活动整体方案摘要",
      "items": ["目标", "亮点"]
    }
  ],
  "fullOutput": null,
  "unlocked": false,
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:27:05.000Z"
}
```

成功响应示例，已解锁：

```json
{
  "id": "P8jkjYJN",
  "mode": "startup",
  "activityName": "春季团建",
  "organizationName": "EventPilot",
  "activityType": "团建",
  "expectedParticipants": 30,
  "dateOrPeriod": "2026-06",
  "location": "上海",
  "budgetRange": "10000-20000",
  "targetAudience": "公司员工",
  "extraContext": "希望轻松有趣",
  "pastedMaterials": "补充材料",
  "status": "ready",
  "previewOutput": [
    {
      "id": "overview",
      "title": "活动概览",
      "summary": "活动整体方案摘要",
      "items": ["目标", "亮点"]
    }
  ],
  "fullOutput": [
    {
      "id": "overview",
      "title": "活动概览",
      "summary": "完整活动方案摘要",
      "items": ["完整目标", "完整执行建议"]
    }
  ],
  "unlocked": true,
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:30:12.000Z"
}
```

状态说明：

| status | 说明 | 前端建议 |
| --- | --- | --- |
| `generating` | AI 正在后台生成 | 继续轮询 |
| `ready` | 生成完成 | 展示 `previewOutput`，如需完整内容引导兑换码解锁 |
| `error` | 生成失败 | 停止轮询，展示失败提示 |

失败响应示例：

`404 Not Found`，任务不存在：

```json
{
  "error": "not_found",
  "message": "任务不存在或链接已失效"
}
```

`500 Internal Server Error`：

```json
{
  "error": "server_error",
  "message": "读取任务失败，请稍后重试"
}
```

前端调用注意事项：

- 不需要登录。
- 未解锁时，即使任务 `status` 是 `ready`，`fullOutput` 也会是 `null`。
- 只有 `unlocked: true` 后，`fullOutput` 才会返回完整内容。
- 建议轮询间隔 1 到 3 秒。遇到 `ready` 或 `error` 后停止轮询。

curl 示例：

```bash
curl http://localhost:8080/api/tasks/P8jkjYJN
```

Axios 轮询示例：

```ts
async function pollTask(taskId: string) {
  const timer = window.setInterval(async () => {
    try {
      const response = await api.get(`/api/tasks/${taskId}`)
      const task = response.data

      if (task.status === "ready" || task.status === "error") {
        window.clearInterval(timer)
      }

      // setTask(task)
    } catch (error) {
      window.clearInterval(timer)
      throw error
    }
  }, 2000)

  return () => window.clearInterval(timer)
}
```

## 兑换码解锁任务

使用兑换码解锁任务完整内容。成功后返回解锁后的任务详情。

| 项目 | 内容 |
| --- | --- |
| 请求方法 | `POST` |
| URL | `/api/tasks/{id}/redeem` |
| 是否需要登录 | 否 |
| 成功状态码 | `200 OK` |

请求 Header：

```http
Content-Type: application/json
Accept: application/json
```

路径参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `id` | string | 任务 ID |

请求 Body：

```json
{
  "code": "EP-ABCD-1234"
}
```

请求字段说明：

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `code` | string | 是 | 兑换码。后端会 trim 并转成大写 |

成功响应示例：

```json
{
  "id": "P8jkjYJN",
  "mode": "startup",
  "activityName": "春季团建",
  "organizationName": "EventPilot",
  "activityType": "团建",
  "expectedParticipants": 30,
  "dateOrPeriod": "2026-06",
  "location": "上海",
  "budgetRange": "10000-20000",
  "targetAudience": "公司员工",
  "extraContext": "希望轻松有趣",
  "pastedMaterials": "补充材料",
  "status": "ready",
  "previewOutput": [
    {
      "id": "overview",
      "title": "活动概览",
      "summary": "活动整体方案摘要",
      "items": ["目标", "亮点"]
    }
  ],
  "fullOutput": [
    {
      "id": "overview",
      "title": "活动概览",
      "summary": "完整活动方案摘要",
      "items": ["完整目标", "完整执行建议"]
    }
  ],
  "unlocked": true,
  "createdAt": "2026-06-03T09:26:13.000Z",
  "updatedAt": "2026-06-03T09:30:12.000Z"
}
```

失败响应示例：

`400 Bad Request`，缺少 `code` 字段：

```json
{
  "error": "invalid_request",
  "message": "请提供兑换码"
}
```

`400 Bad Request`，兑换码为空字符串：

```json
{
  "error": "invalid_request",
  "message": "兑换码不能为空"
}
```

`404 Not Found`，任务不存在：

```json
{
  "error": "not_found",
  "message": "任务不存在或链接已失效"
}
```

`404 Not Found`，兑换码无效：

```json
{
  "error": "invalid_code",
  "message": "兑换码无效，请检查后重试。"
}
```

`409 Conflict`，兑换码已被使用：

```json
{
  "error": "code_already_used",
  "message": "该兑换码已被使用。"
}
```

`500 Internal Server Error`：

```json
{
  "error": "server_error",
  "message": "验证失败，请稍后重试"
}
```

前端调用注意事项：

- 不需要登录。
- 兑换成功后直接使用响应体更新当前任务状态。
- 成功响应中 `unlocked` 会是 `true`。
- 解锁后 `fullOutput` 才会返回完整内容；未解锁时该字段为 `null`。

curl 示例：

```bash
curl -X POST http://localhost:8080/api/tasks/P8jkjYJN/redeem \
  -H "Content-Type: application/json" \
  -d '{"code":"EP-ABCD-1234"}'
```

Axios 示例：

```ts
const response = await api.post(`/api/tasks/${taskId}/redeem`, {
  code: "EP-ABCD-1234",
})

const unlockedTask = response.data
```

## 推荐前端调用流程

### 注册/登录流程

1. 用户提交邮箱、密码和可选昵称。
2. 调用 `POST /api/auth/register`。
3. 注册成功后按产品流程处理：可以读取 `response.data.token` 直接登录，也可以跳转登录页让用户重新登录。
4. 如果注册返回 `409 user_exists`，提示用户改为登录。
5. 用户登录时调用 `POST /api/auth/login`。
6. 登录成功后同样保存 `response.data.token`。
7. 需要确认登录态时，调用 `GET /api/auth/me`，并携带 `Authorization: Bearer <token>`。

### 创建任务流程

1. 用户填写活动信息。
2. 确认本地已有有效 JWT；未登录时先跳转登录页。
3. 调用 `POST /api/tasks`，并携带 `Authorization: Bearer <token>`。
4. 后端返回 `202` 和 `{ id, status: "generating" }`。
5. 前端保存任务 `id`。
6. 跳转到任务结果页，例如 `/tasks/{id}` 或当前前端约定的结果页。

### 轮询任务结果流程

1. 使用任务 `id` 调用 `GET /api/tasks/{id}`。
2. 如果 `status` 是 `generating`，继续轮询。
3. 如果 `status` 是 `ready`，停止轮询并展示 `previewOutput`。
4. 如果 `status` 是 `error`，停止轮询并展示失败提示。
5. 如果 `unlocked` 是 `false`，不要依赖 `fullOutput`，因为后端会返回 `null`。

### 兑换码解锁流程

1. 用户输入兑换码。
2. 调用 `POST /api/tasks/{id}/redeem`。
3. 如果成功，后端返回解锁后的完整任务。
4. 前端用响应体覆盖当前任务数据。
5. 此时 `unlocked` 为 `true`，`fullOutput` 可以展示。

## Axios 基础封装示例

```ts
import axios from "axios"

export const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("eventpilot_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.response?.data?.error ||
      "请求失败，请稍后重试"
    )
  }
  return "请求失败，请稍后重试"
}
```

任务 API 示例：

```ts
export async function createTask(payload: {
  mode: "startup" | "review" | "handoff"
  activityName: string
  organizationName: string
  activityType?: string
  expectedParticipants?: number | string
  dateOrPeriod?: string
  location?: string
  budgetRange?: string
  targetAudience?: string
  extraContext?: string
  pastedMaterials?: string
}) {
  const response = await api.post("/api/tasks", payload)
  return response.data as { id: string; status: "generating" }
}

export async function getTask(id: string) {
  const response = await api.get(`/api/tasks/${id}`)
  return response.data
}

export async function redeemTask(id: string, code: string) {
  const response = await api.post(`/api/tasks/${id}/redeem`, { code })
  return response.data
}
```

认证 API 示例：

```ts
export async function register(payload: {
  email: string
  password: string
  name?: string
}) {
  const response = await api.post("/api/auth/register", payload)
  return response.data
}

export async function login(payload: { email: string; password: string }) {
  const response = await api.post("/api/auth/login", payload)
  localStorage.setItem("eventpilot_token", response.data.token)
  return response.data
}

export async function getCurrentUser() {
  const response = await api.get("/api/auth/me")
  return response.data
}
```

## 前端接入检查清单

- [ ] Base URL 使用 `http://localhost:8080`。
- [ ] 所有 JSON POST 请求都带 `Content-Type: application/json`。
- [ ] 注册成功后从 `response.data.token` 保存 JWT。
- [ ] 登录成功后从 `response.data.token` 保存 JWT。
- [ ] 请求 `/api/auth/me` 时携带 `Authorization: Bearer <token>`。
- [ ] 创建任务 `POST /api/tasks` 时携带 `Authorization: Bearer <token>`。
- [ ] `Bearer` 和 token 中间有一个空格。
- [ ] 收到 `401 unauthorized` 或 `401 invalid_token` 时清理本地 token，并引导重新登录。
- [ ] 创建任务接口按 `202 Accepted` 处理。
- [ ] 创建任务后根据返回的 `id` 轮询 `GET /api/tasks/{id}`。
- [ ] 轮询时只把 `generating` 当作继续等待状态。
- [ ] `ready` 和 `error` 都应该停止轮询。
- [ ] 未解锁时不要展示或依赖 `fullOutput`，因为后端会返回 `null`。
- [ ] 兑换码解锁成功后，用返回的完整任务响应更新页面状态。
- [ ] 错误提示兼容 `{ "error": "xxx" }` 和 `{ "error": "xxx", "message": "xxx" }` 两种格式。
- [ ] 保持 `GET /api/tasks/{id}` 和 `POST /api/tasks/{id}/redeem` 匿名访问，除非后续产品需求明确要求收紧。
