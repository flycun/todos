# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个使用 Next.js 15 + Prisma + PostgreSQL 构建的现代化全栈 Todo 应用。

**核心特性:**
- React Server Components (RSC) 架构
- PostgreSQL 数据库（通过 Prisma ORM）
- 自定义认证系统（基于 bcrypt + database sessions）
- 完整的 Todo CRUD 功能，支持分类、标签、优先级
- 使用 Zod 进行运行时验证

## 常用命令

### 开发
```bash
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
npm run lint         # 运行 ESLint
```

### 数据库操作
```bash
npm run db:generate  # 生成 Prisma Client
npm run db:push      # 推送 schema 变更到数据库（开发环境）
npm run db:migrate   # 创建并应用迁移
npm run db:studio    # 打开 Prisma Studio（数据库 GUI）
npm run db:seed      # 运行种子数据脚本
```

**注意:** `postinstall` 脚本会自动运行 `prisma generate`，所以在 `npm install` 后无需手动生成。

## 技术栈与架构

### 前端
- **Next.js 15** - App Router 架构，Server Components 默认启用
- **React 19** - 最新版本
- **TypeScript** - 严格模式
- **Tailwind CSS** - 样式
- **shadcn/ui** - 基于 Radix UI 的组件库（位于 `components/ui/`）

### 后端
- **API Routes** - 位于 `app/api/`，使用标准的 REST 模式
- **自定义认证** - 不使用 NextAuth.js，而是自定义实现（`lib/auth.ts`, `app/api/auth/`）
- **Prisma ORM** - 类型安全的数据库访问
- **Zod** - 输入验证（`lib/validations/`）

### 数据库
- **PostgreSQL** - 生产数据库
- **Prisma** - Schema 定义在 `prisma/schema.prisma`

## 核心架构模式

### 1. 认证系统

应用使用**自定义认证实现**，而非 NextAuth.js：

**Session 管理:**
- Sessions 存储在数据库中（`sessions` 表）
- Session token 通过 httpOnly cookie 传递
- 使用 `getServerSession()` 和 `requireAuth()` 辅助函数（`lib/auth.ts`）

**关键文件:**
- `lib/auth.ts` - Session 验证逻辑
- `app/api/auth/register/route.ts` - 用户注册
- `app/api/auth/callback/route.ts` - 登录回调
- `app/api/auth/logout/route.ts` - 登出

**认证流程:**
1. 用户注册时，密码通过 bcrypt 哈希（`register/route.ts`）
2. 登录成功后创建 session 记录，设置 cookie
3. 受保护的 API 路由使用 `requireAuth()` 验证用户身份
4. Server Components 可以使用 `getServerSession()` 获取当前用户

### 2. 数据模型

**核心模型**（`prisma/schema.prisma`）:
- `User` - 用户信息，包含密码哈希
- `Todo` - 待办事项，关联用户、分类、标签
- `Category` - 分类（用户级别）
- `Tag` - 标签（全局共享）
- `TodoTag` - Todo-Tag 多对多关系
- `Session` - NextAuth 兼容的 session 表
- `Account` - OAuth 账号关联（预留）

**重要关系:**
- Todo → User (多对一)
- Todo → Category (多对一，可选)
- Todo ↔ Tag (多对多，通过 TodoTag)

### 3. API 路由模式

所有 API 路由遵循标准 REST 模式：

**认证检查:**
```typescript
const user = await requireAuth()
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**输入验证:**
```typescript
const validatedData = todoSchema.parse(body)
```

**错误处理:**
```typescript
if (error.name === 'ZodError') {
  return NextResponse.json({ error: '输入数据格式错误' }, { status: 400 })
}
```

**示例路由:**
- `app/api/todos/route.ts` - GET（列表）、POST（创建）
- `app/api/todos/[id]/route.ts` - PUT（更新）、DELETE（删除）
- `app/api/todos/[id]/toggle/route.ts` - PATCH（切换完成状态）

### 4. 组件架构

**Server Components vs Client Components:**
- 大部分页面组件是 Server Components
- 交互式表单和动态 UI 是 Client Components（使用 `'use client'` 指令）

**目录结构:**
```
components/
├── ui/              # shadcn/ui 基础组件（button, input, card 等）
├── auth/            # 认证相关表单（login-form, register-form）
└── todo/            # Todo 功能组件（todo-form, todo-list）
```

**布局:**
- `app/layout.tsx` - 根布局
- `app/(auth)/layout.tsx` - 认证页面布局（登录/注册）
- `app/(dashboard)/layout.tsx` - 主应用布局

### 5. 数据验证

使用 Zod schemas 定义输入验证规则（`lib/validations/`）:

- `auth.ts` - 用户注册/登录验证
- `todo.ts` - Todo CRUD 验证
- `category.ts` - 分类验证

**示例:**
```typescript
export const todoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  // ...
})
```

## 数据库操作

### 迁移流程

**开发环境（使用 db:push）:**
```bash
# 修改 schema.prisma 后
npm run db:push
```
这会直接更新数据库结构，无需创建迁移文件。

**生产环境（使用 migrations）:**
```bash
# 创建迁移
npm run db:migrate

# 部署时应用迁移
npx prisma migrate deploy
```

### Prisma Client 单例

Prisma Client 使用全局单例模式（`lib/prisma.ts`）避免开发环境热重载时创建多个连接实例。

### 种子数据

运行 `npm run db:seed` 会创建示例用户（demo@example.com / password123）、分类、标签和待办事项。

## 环境变量

必需的环境变量（见 `.env.example`）:

```bash
DATABASE_URL="postgresql://..."  # 数据库连接字符串
NEXTAUTH_SECRET="..."            # 认证密钥（生产环境必须更改）
NEXTAUTH_URL="http://localhost:3000"  # 应用 URL
```

**本地开发**使用文件数据库（SQLite）:
```bash
DATABASE_URL="file:./dev.db"
```

**生产环境**切换到 PostgreSQL。注意文档中提到应该使用 PostgreSQL，但 schema.prisma 当前配置为 `postgresql` provider。

## 关键约定

### 1. 路由组织
- 使用 Route Groups 组织相关路由：
  - `(auth)` - 公开的认证页面
  - `(dashboard)` - 需要认证的应用页面

### 2. 类型导出
- TypeScript 路径别名：`@/*` 映射到项目根目录
- Prisma 生成的类型从 `@prisma/client` 导入

### 3. 样式约定
- 使用 Tailwind utility classes
- shadcn/ui 组件使用 `cn()` 工具函数合并类名（`lib/utils.ts`）

### 4. 错误处理
- API 路由返回 JSON 格式错误：`{ error: "错误信息" }`
- 使用适当的 HTTP 状态码（400, 401, 500 等）

## 部署注意事项

### Vercel 部署
1. 设置环境变量（DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL）
2. 推送代码后自动部署
3. 运行 `npx prisma migrate deploy` 应用数据库迁移

### 数据库切换
当前 schema.prisma 使用 PostgreSQL。如果需要在本地使用 SQLite：
1. 修改 `prisma/schema.prisma`: `provider = "sqlite"`
2. 更新 `.env`: `DATABASE_URL="file:./dev.db"`
3. 运行 `npm run db:push`

（注意：SQLite 不支持某些 PostgreSQL 特性，如 enums）

## 已知限制与未来扩展

根据 `docs/replicated-forging-pancake.md` 架构文档，计划中的功能包括：
- 子任务（Subtasks）
- 文件附件上传
- 协作功能（多用户共享）
- 提醒通知
- 日历视图
- 时间跟踪

这些功能需要添加新的数据模型和 API 路由。

## 调试技巧

### 查看数据库
```bash
npm run db:studio
```
打开 Prisma Studio 可视化查看和编辑数据。

### 检查 Prisma 查询
Prisma 在开发环境会自动记录查询日志。可以在终端查看执行的 SQL。

### 常见问题
- **"Prisma Client is not generated"**: 运行 `npm run db:generate`
- **认证失败**: 检查 cookie 设置和 NEXTAUTH_SECRET
- **数据库连接错误**: 验证 DATABASE_URL 格式

## TypeScript 配置

- 严格模式已启用
- 路径别名: `@/*` → 项目根目录
- Target: ES2017
- 使用 `bundler` 模式的模块解析（Next.js 15 推荐）
