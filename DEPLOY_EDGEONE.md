# 部署到 EdgeOne Pages（国际站）+ Supabase

本文档记录将 Todo App 部署到 [EdgeOne Pages](https://pages.edgeone.ai) 的完整流程，
使用 [Supabase](https://supabase.com) 作为云 PostgreSQL 数据库。

## 架构

```
EdgeOne Pages (Next.js 运行时, rhel-openssl-1.1.x)
        │  (Prisma via postgresql 协议)
        ▼
Supabase Postgres (pooler 端口 6543)
```

## 已做的适配（针对 EdgeOne 全栈运行时坑）

| 改动 | 原因 |
|------|------|
| `schema.prisma` 加 `binaryTargets = ["native", "rhel-openssl-1.1.x"]` | EdgeOne 运行时是 RHEL 系，缺这个平台引擎会导致所有带 DB 的请求 500（`could not locate the Query Engine for runtime "rhel-openssl-1.1.x"`） |
| `bcrypt` → `bcryptjs`（纯 JS） | 原生 bcrypt 是 C++ 扩展，EdgeOne 无服务器运行时打包/加载不稳 |
| `package.json` 保留 `postinstall: prisma generate` | 确保 EdgeOne 构建期生成 Prisma Client |
| `next.config.ts` 的 `allowedOrigins` 走 `ALLOWED_ORIGINS` 环境变量 | 部署后 Server Actions 需匹配生产域名，否则被阻断 |

---

## 步骤 1：准备 Supabase 数据库

1. 注册 https://supabase.com → 新建项目（免费 500MB）
2. 进入 **Project Settings → Database → Connection string**
3. 选择 **Transaction mode**（Pooler，端口 **6543**），复制连接串，形如：
   ```
   postgresql://postgres.abcdefg:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   > ⚠️ Prisma 必须用 **6543**（Pooler），不要用直连 5432。
4. 把 `[YOUR-PASSWORD]` 替换为你的数据库密码。

## 步骤 2：本地初始化数据库 schema

把 Supabase 连接串填入 `.env.local`（覆盖本地开发值）：

```bash
DATABASE_URL="postgresql://postgres.abcdefg:密码@aws-0-xx.pooler.supabase.com:6543/postgres"
```

推送 schema 并（可选）填充示例数据：

```bash
npm run db:generate   # 重新生成（带 rhel 引擎）
npm run db:push       # 在 Supabase 创建所有表
npm run db:seed       # 可选：创建 demo 用户 / 分类 / 待办
```

## 步骤 3：登录并初始化 EdgeOne

```bash
# 浏览器登录 EdgeOne 国际站账号
edgeone login
edgeone whoami      # 确认登录成功

# 初始化项目（选择 Next.js 框架，其余默认）
edgeone pages init
```

## 步骤 4：⭐ 先 link 项目（否则 env 设置会静默失效）

> 这是 EdgeOne 最隐蔽的坑：不 link 项目，`env set` 返回成功但实际不落地。

```bash
edgeone pages link
# 提示输入 project name → 输入你的项目名（如 todo-app）→ linked successfully
```

确认生成了 `.edgeone/project.json`（已在 .gitignore）。

## 步骤 5：配置环境变量

```bash
# 1. 设置
edgeone pages env set DATABASE_URL    "postgresql://postgres.abcdefg:密码@aws-0-xx.pooler.supabase.com:6543/postgres"
edgeone pages env set NEXTAUTH_SECRET "$(openssl rand -base64 32)"
edgeone pages env set NEXTAUTH_URL    "https://todo-app.edgeone.app"   # 部署后改成实际域名
edgeone pages env set ALLOWED_ORIGINS "todo-app.edgeone.app"

# 2. ⚠️ 必须验证！env set 的成功返回不可信
edgeone pages env ls
# 应能看到上面 4 个变量；若显示 "No environment variables found" 说明项目没 link，回步骤 4
```

## 步骤 6：部署

```bash
edgeone pages deploy -a overseas
#   -a overseas : 仅海外节点（国际项目，访问更稳定）
#   -a global   : 全球含中国大陆（默认）
```

部署成功会输出 `EDGEONE_DEPLOY_URL`。

## 步骤 7：回填域名

部署后拿到实际域名（如 `xxx.edgeone.app`），更新两个环境变量后重新部署：

```bash
edgeone pages env set NEXTAUTH_URL    "https://xxx.edgeone.app"
edgeone pages env set ALLOWED_ORIGINS "xxx.edgeone.app"
edgeone pages env ls    # 再次验证
edgeone pages deploy -a overseas
```

---

## 验证清单（宣布可用前逐项确认）

- [ ] `ls node_modules/.prisma/client/libquery_engine-*.so.node` 看到两个引擎文件（debian + rhel）
- [ ] 已执行 `edgeone pages link`（存在 `.edgeone/project.json`）
- [ ] `env ls` 能看到 DATABASE_URL / NEXTAUTH_SECRET / NEXTAUTH_URL / ALLOWED_ORIGINS
- [ ] 浏览器打开部署 URL，主页返回真实 HTML
- [ ] 注册 → 登录成功（cookie 认证正常）
- [ ] 创建/查看/删除待办正常（DB 读写正常）

## 排查：部署成功但 500

看云端日志（CLI 无日志命令，必须去控制台）：

```
https://console.tencentcloud.com/edgeone/pages/project/<PROJECT_ID>
→ 「日志」/「函数日志」
```

| 云日志关键词 | 根因 | 修复 |
|------|------|------|
| `could not locate the Query Engine for runtime "rhel-openssl-1.1.x"` | binaryTargets 缺平台 | 确认 schema.prisma 含 `rhel-openssl-1.1.x`，重新 `db:generate` + 部署 |
| `@prisma/client did not initialize yet` | 构建期没 generate | 确认 `package.json` 有 `postinstall: prisma generate` |
| 应用拿不到环境变量 / DB 连接失败 | 项目未 link，env 静默失效 | 回步骤 4 先 `pages link`，再设 env 并 `env ls` 验证 |

## curl 测试预览 URL（注意鉴权 cookie）

deploy 返回的 URL 带 `?eo_token=...`，首次访问会写 cookie 并 302。用 curl 要先拿 cookie：

```bash
URL="https://xxx.edgeone.app?eo_token=abc&eo_time=123"
COOKIE=$(mktemp)
curl -s -c "$COOKIE" -o /dev/null "$URL"
curl -s -b "$COOKIE" -w "\n[HTTP %{http_code}]\n" "https://xxx.edgeone.app/login"
rm -f "$COOKIE"
```
