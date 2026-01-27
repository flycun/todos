# Todo App

现代化待办事项管理应用，使用 Next.js 15、Prisma 和 Session-based 认证构建。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## 📚 文档

完整的项目文档请查看 [docs/](./docs/README.md)：

- 📖 [用户使用手册](./docs/USER_GUIDE.md) - 快速开始和功能说明
- 🔧 [开发者指南](./docs/DEVELOPER_GUIDE.md) - 开发环境、规范和部署
- 🏗️ [系统架构文档](./docs/ARCHITECTURE.md) - 技术架构和设计决策
- 🔌 [API 文档](./docs/API.md) - RESTful API 参考
- 📋 [OpenAPI 规范](./docs/openapi.json) - 标准化 API 定义
- 🔄 [变更日志](./docs/CHANGELOG.md) - 版本历史和路线图
- 🚀 [Vercel 部署快速指南](./docs/QUICK_START_VERCEL.md) - 3 分钟部署到 Vercel
- ☁️ [完整部署指南](./docs/VERCEL_DEPLOYMENT.md) - 详细的部署说明和故障排查

## 技术栈

- **前端**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **后端**: Next.js API Routes, Prisma ORM
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **认证**: 自定义实现 (Session-based)
- **验证**: Zod

## 功能特性

- ✅ 用户注册和登录
- ✅ 创建、删除待办事项
- ✅ 任务优先级设置 (高/中/低)
- ✅ 截止日期设置
- ✅ 任务分类管理
- ✅ 标签系统
- ✅ 统计仪表盘
- ✅ 响应式设计

## 开始使用

### 1. 安装依赖

```bash
npm install
```

### 2. 初始化数据库

```bash
# 生成 Prisma Client
npm run db:generate

# 推送 schema 到数据库
npm run db:push

# (可选) 填充示例数据
npm run db:seed
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 4. 测试账号

```
邮箱: demo@example.com
密码: password123
```

## 项目结构

```
todo-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── (dashboard)/       # 主应用页面
│   ├── api/               # API 路由
│   └── actions/           # Server Actions
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   ├── todo/             # Todo 组件
│   └── auth/             # 认证组件
├── lib/                  # 工具库
│   ├── validations/      # Zod 验证 schemas
│   └── auth.ts          # 认证配置
├── prisma/              # Prisma 配置
│   ├── schema.prisma    # 数据库 schema
│   └── seed.ts          # 种子数据
├── docs/                # 项目文档
└── types/               # TypeScript 类型定义
```

## 可用脚本

```bash
# 开发
npm run dev              # 启动开发服务器

# 构建
npm run build            # 构建生产版本
npm run start            # 启动生产服务器

# 数据库
npm run db:generate      # 生成 Prisma Client
npm run db:push          # 推送 schema 到数据库
npm run db:migrate       # 创建数据库迁移
npm run db:studio        # 打开 Prisma Studio
npm run db:seed          # 填充示例数据

# 代码检查
npm run lint             # 运行 ESLint
```

## 环境变量

复制 `.env.example` 到 `.env` 并配置：

```bash
# 数据库
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## 部署

### Vercel (推荐)

**快速开始**：查看 [🚀 Vercel 部署快速指南](./docs/QUICK_START_VERCEL.md)

**重要提醒**：此应用使用 SQLite 本地数据库，无法直接部署到 Vercel。必须切换到云数据库：

1. **创建云数据库**（免费）：
   - Vercel Postgres (256MB)
   - Supabase (500MB)
   - Neon (3GB)

2. **配置环境变量**：
   ```
   DATABASE_URL=你的云数据库连接字符串
   NEXTAUTH_SECRET=运行 openssl rand -base64 32 生成
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. **推送代码**：
   ```bash
   git push origin main
   ```

详细说明请查看：
- ☁️ [完整部署指南](./docs/VERCEL_DEPLOYMENT.md)
- 🚀 [快速开始指南](./docs/QUICK_START_VERCEL.md)

### Docker

```bash
docker build -t todo-app .
docker run -p 3000:3000 --env-file .env todo-app
```

## 开发指南

详细的开发指南请查看 [开发者文档](./docs/DEVELOPER_GUIDE.md)

### 添加新功能

1. 在 `lib/validations/` 添加验证 schema
2. 在 `app/api/` 创建 API 路由
3. 在 `components/` 创建 UI 组件
4. 更新数据库 schema (如需要): `npx prisma migrate dev`

### 数据库迁移

```bash
# 修改 prisma/schema.prisma

# 创建迁移
npx prisma migrate dev --name your_migration_name

# 生产环境部署迁移
npx prisma migrate deploy
```

## 🤝 贡献

欢迎贡献代码！请查看 [开发者指南](./docs/DEVELOPER_GUIDE.md) 了解详情。

## 📄 License

MIT License - 查看 [LICENSE](./LICENSE) 文件了解详情

## 🔗 相关链接

- [文档中心](./docs/README.md)
- [API 文档](./docs/API.md)
- [用户指南](./docs/USER_GUIDE.md)
- [架构文档](./docs/ARCHITECTURE.md)

---

**需要帮助？** 查看 [文档中心](./docs/README.md) 或提交 [Issue](https://github.com/your-org/todo-app/issues)
