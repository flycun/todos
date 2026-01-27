# 清理 Git 历史的简化命令

## 情况说明
- ✅ GitHub 仓库已删除（远程泄露已清除）
- ✅ 当前代码已修复
- ❌ 本地 Git 历史仍包含敏感信息

## 清理步骤（Windows PowerShell）

```powershell
# 1. 清理特定文件的历史（保留其他历史）
git filter-branch --force --index-filter `
  "git rm --cached --ignore-unmatch docs/ENV_VARS.md" `
  --prune-empty --tag-name-filter cat -- --all

# 2. 清理 refs
Remove-Item -Recurse -Force ".git\refs\original" -ErrorAction SilentlyContinue

# 3. 垃圾回收（物理删除数据）
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 4. 验证清理结果
git log --all -p -S "281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c"

# 如果输出为空，说明清理成功
```

## 或者：完全重写历史（推荐）

如果你不需要保留这个泄露提交之前的任何历史：

```powershell
# 1. 删除 .git 文件夹
Remove-Item -Recurse -Force .git

# 2. 重新初始化 Git 仓库
git init

# 3. 添加所有文件
git add .

# 4. 创建全新的初始提交
git commit -m "Initial commit: Clean codebase without sensitive data"

# 5. 重新创建 GitHub 仓库时使用这个干净的本地仓库
```

## 验证

```powershell
# 搜索敏感信息
git log --all -p -S "281eac92d832443919ca74bf9d733a2226f947b775c78c34d9b279928707f44c"
git log --all -p -S "sk_0jzMsH7-VecPtTbDmqhwS"
git log --all -p -S "db.prisma.io"

# 应该没有任何输出
```

## 完成后

1. **轮换 Prisma Cloud API Key**（最重要！）
2. 重新创建 GitHub 仓库
3. 推送干净的代码
4. 更新所有环境变量
