#!/bin/sh

# 脚本执行时自动退出，如果任何命令出错
set -e

# 获取当前分支
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "当前分支: $current_branch"

pnpm run migration:generate

# 添加所有修改
git add .

# 提交
git commit -m "ci: 生成数据库迁移配置"

# 推送到当前分支
git push origin "$current_branch"

echo "代码已成功推送到 $current_branch 分支！"