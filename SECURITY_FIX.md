# 🚨 安全漏洞修复指南

## 漏洞概述

GitGuardian 在 `flycun/todos` 仓库中检测到 **PostgreSQL URI 泄露**，该泄露发生于 2026年1月27日 06:40:34 UTC。

### 泄露的敏感信息

**文件**: `docs/ENV_VARS.md` (第70行)

```
postgres://281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c:sk_0jzMsH7-VecPtTbDmqhwS@db.prisma.io:5432/postgres?sslmode=require
```

这是一个 **Prisma Cloud 数据库连接字符串**，包含：
- ✗ Project ID: `281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c`
- ✗ API Key: `sk_0jzMsH7-VecPtTbDmqhwS`
- ✗ 数据库主机: `db.prisma.io:5432`

---

## ⚡ 立即执行的修复步骤

### 步骤 1: 立即轮换数据库凭证

**最紧急优先级！**

1. 登录 [Prisma Cloud Console](https://cloud.prisma.io/)
2. 找到对应的项目（Project ID: `281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c`）
3. **删除或轮换 API Key** `sk_0jzMsH7-VecPtTbDmqhwS`
4. 生成新的 API Key
5. 更新所有使用该数据库的环境：
   - `.env.local` (本地开发)
   - Vercel 环境变量
   - 任何其他部署平台

**Prisma Cloud 轮换步骤**:
```bash
# 在 Prisma Cloud Console 中:
1. Settings → API Keys
2. 找到泄露的 key → Revoke
3. Create new API key
4. 复制新的连接字符串
```

### 步骤 2: 检查数据库异常访问

1. 在 Prisma Cloud 中查看访问日志
2. 检查是否有未授权的访问记录（2026年1月27日之后）
3. 如果发现异常活动：
   - 记录访问来源 IP
   - 检查数据是否被导出或修改
   - 考虑通知受影响的用户

### 步骤 3: 清理 Git 历史中的敏感信息

**方法 A: 使用 git-filter-repo（推荐）**

```bash
# 1. 安装 git-filter-repo
pip install git-filter-repo

# 2. 创建完整备份
git clone --mirror https://github.com/flycun/todos.git todos-backup

# 3. 清理敏感信息
git filter-repo --invert-paths \
  --path docs/ENV_VARS.md \
  --path docs/QUICK_START_VERCEL.md

# 4. 强制推送到远程仓库（⚠️ 谨慎操作）
git push origin --force --all
git push origin --force --tags
```

**方法 B: 使用 BFG Repo-Cleaner**

```bash
# 1. 下载 BFG
# 访问: https://rtyley.github.io/bfg-repo-cleaner/

# 2. 清理包含特定字符串的文件
bfg --replace-text passwords.txt

# 3. 创建 passwords.txt 文件，内容：
# postgres://281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c:sk_0jzMsH7-VecPtTbDmqhwS@db.prisma.io

# 4. 清理 Git 历史
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. 强制推送
git push origin --force --all
```

**方法 C: 手动移除特定文件（简单但影响范围较小）**

```bash
# 1. 从当前版本移除文件
git rm --cached docs/ENV_VARS.md
echo "docs/ENV_VARS.md" >> .gitignore

# 2. 提交更改
git commit -m "security: remove sensitive database credentials from docs"

# 3. 重写历史（仅移除该文件的所有版本）
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch docs/ENV_VARS.md" \
  --prune-empty --tag-name-filter cat -- --all

# 4. 强制推送
git push origin --force --all
git push origin --force --tags
```

### 步骤 4: 更新所有环境变量

```bash
# 本地开发环境
# 编辑 .env.local
DATABASE_URL="postgresql://new-user:new-password@new-host:5432/dbname"

# Vercel 生产环境
# 1. 访问 https://vercel.com/dashboard
# 2. 进入项目 → Settings → Environment Variables
# 3. 更新 DATABASE_URL
# 4. 重新部署应用
```

---

## 🔒 防止未来泄露的措施

### 1. 增强 .gitignore

```bash
# .gitignore
# 环境变量
.env
.env.local
.env.*.local

# 敏感文档
docs/*SECRET*.md
docs/*CREDENTIALS*.md
**/secrets/
**/.credentials/
```

### 2. 使用 Pre-commit Hooks

创建 `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# 检查是否包含敏感信息
if git diff --cached --name-only | xargs grep -l "DATABASE_URL.*postgresql://.*@"; then
  echo "⚠️  检测到可能的数据库连接字符串！"
  echo "请检查文件并移除敏感信息。"
  exit 1
fi

if git diff --cached --name-only | xargs grep -l "sk_.*@"; then
  echo "⚠️  检测到可能的 API Key！"
  echo "请检查文件并移除敏感信息。"
  exit 1
fi

exit 0
```

使其可执行:
```bash
chmod +x .git/hooks/pre-commit
```

### 3. 使用 Git-secrets 或 TruffleHog

**安装 git-secrets**:
```bash
# macOS
brew install git-secrets

# Linux
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
make install
```

配置:
```bash
git secrets --install
git secrets --register-aws
git secrets --add 'postgresql://.*@'
git secrets --add 'postgres://.*@'
git secrets --add 'sk_[a-zA-Z0-9-]{20,}'
```

**使用 TruffleHog 扫描**:
```bash
# 安装
pip install truffleHog

# 扫描当前仓库
trufflehog --regex --entropy=False /path/to/repo
```

### 4. 添加 GitHub Secrets Scanning

1. 在 GitHub 仓库中启用 **Secret Scanning**
2. 配置 **Push Protection** - 防止敏感信息被推送
3. 设置 **Dependabot** - 监控依赖漏洞

### 5. 使用环境变量管理工具

```bash
# 推荐工具
- direnv         # 自动加载/卸载环境变量
- dotenv         # 跨平台环境变量管理
- vault          # HashiCorp Vault（企业级）
```

---

## 📋 安全检查清单

### ✅ 立即执行（1小时内）

- [ ] 轮换 Prisma Cloud API Key
- [ ] 更新所有环境中的 DATABASE_URL
- [ ] 检查数据库访问日志
- [ ] 从代码仓库移除敏感信息
- [ ] 清理 Git 历史

### ✅ 短期执行（24小时内）

- [ ] 配置 pre-commit hooks
- [ ] 安装 git-secrets 或 TruffleHog
- [ ] 更新文档（移除所有示例凭证）
- [ ] 团队安全培训
- [ ] 审查其他可能的敏感信息

### ✅ 长期执行（1周内）

- [ ] 建立密钥轮换策略
- [ ] 实施访问日志监控
- [ ] 配置自动化安全扫描
- [ ] 建立安全事件响应流程
- [ ] 定期安全审计

---

## 🔍 如何验证修复是否成功

### 1. 验证敏感信息已从当前代码移除

```bash
# 搜索可能残留的凭证
grep -r "281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c" .
grep -r "sk_0jzMsH7-VecPtTbDmqhwS" .
grep -r "db.prisma.io" .

# 如果没有任何输出，说明已清除
```

### 2. 验证 Git 历史已清理

```bash
# 搜索历史记录
git log --all -p -S "281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c"

# 应该没有匹配的提交
```

### 3. 验证新凭证有效

```bash
# 测试数据库连接
npx prisma db pull

# 如果成功，说明新凭证有效
```

### 4. 使用 GitGuardian 重新扫描

访问 GitGuardian Dashboard，重新扫描仓库，确保没有发现新的敏感信息。

---

## 📞 需要通知的相关方

根据泄露的严重程度，可能需要通知：

- [ ] 内部开发团队
- [ ] 数据库提供商（Prisma Cloud）
- [ ] GitHub Security Advisory（如果是公共仓库）
- [ ] 受影响的最终用户（如果数据被泄露）

---

## 📚 参考资源

- [GitGuardian Secret Detection](https://www.gitguardian.com/)
- [OWASP Key Management](https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-secrets (AWS)](https://github.com/awslabs/git-secrets)
- [TruffleHog](https://trufflesecurity.github.io/trufflehog/)

---

## ⚠️ 重要提醒

1. **不要直接修复后推送** - 必须先清理 Git 历史
2. **通知所有协作者** - 他们需要强制同步本地仓库
3. **备份重要数据** - 在执行任何清理操作前
4. **测试新的凭证** - 确保应用正常运行

---

**最后更新**: 2026-01-27
**严重程度**: 🔴 严重 (Critical)
**状态**: ⏳ 待修复
