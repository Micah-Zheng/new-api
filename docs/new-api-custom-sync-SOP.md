# new-api 私人定制与上游同步 SOP

适用场景：你在 `new-api` 前端做了私人化定制，同时希望持续同步上游 `QuantumNous/new-api` 的最新更新。

## 0. 核心原则

- `origin` 是上游项目：`https://github.com/QuantumNous/new-api.git`
- `fork` 是你自己的仓库：`https://github.com/Micah-Zheng/new-api.git`
- 不要把私人化分支 push 到 `origin`。
- 私人化改动放在独立分支，例如：`private/custom-ui`。
- `main` 尽量只用于跟随上游，不直接做私人化修改。
- 前端私人化配置尽量集中在：`web/default/src/custom/`。

## 1. 首次准备

进入项目目录：

```bash
cd /Users/micahzheng/projects/new-api
```

确认远端：

```bash
git remote -v
```

正常应该类似：

```text
origin  https://github.com/QuantumNous/new-api.git
fork    https://github.com/Micah-Zheng/new-api.git
```

开启 Git 冲突复用：

```bash
git config rerere.enabled true
```

确认已开启：

```bash
git config --get rerere.enabled
```

输出应为：

```text
true
```

## 2. 创建私人化分支

如果还没有定制分支：

```bash
git switch main
git fetch origin
git merge origin/main
git switch -c private/custom-ui
```

如果已经有定制分支：

```bash
git switch private/custom-ui
```

## 3. 提交私人化改动

先检查当前改动：

```bash
git status --short --branch
```

暂存需要保留的私人化文件，例如：

```bash
git add .gitignore web/default/src/custom web/default/src/hooks/use-sidebar-data.ts web/default/src/hooks/use-top-nav-links.ts web/default/src/features/wallet web/default/src/features/pricing web/default/src/i18n/locales
```

如果有已经被上游合并的补丁，例如 `model/option.go`，不要重复提交进私人化分支。可以先确认：

```bash
git diff origin/main -- model/option.go
```

如果没有输出，说明它和上游一致，不需要提交。

提交本地 commit：

```bash
git commit -m "customize frontend UI overrides"
```

注意：`git commit` 只是本地提交，不会上传到 GitHub。

## 4. 同步上游更新

切到定制分支：

```bash
git switch private/custom-ui
```

拉取上游最新信息：

```bash
git fetch origin
```

合并上游：

```bash
git merge origin/main
```

这一步仍然只是本地操作，不会 push。

## 5. 处理合并冲突

查看冲突文件：

```bash
git diff --name-only --diff-filter=U
```

逐个打开冲突文件，处理冲突标记：

```text
<<<<<<< HEAD
你的定制分支内容
=======
上游 origin/main 内容
>>>>>>> origin/main
```

处理原则：

- 导航、品牌、外链、币种、钱包展示等私人化内容，尽量保留并接入 `web/default/src/custom/`。
- 上游新增的结构、类型、组件重构，尽量保留。
- 如果上游已经实现了你的旧补丁，不要重复保留旧代码。
- 冲突解决后，文件中不能再有 `<<<<<<<`、`=======`、`>>>>>>>`。

检查是否还有冲突标记：

```bash
grep -R -n '<<<<<<<\|=======\|>>>>>>>' web/default/src || true
```

标记冲突已解决：

```bash
git add 冲突文件路径
```

确认没有未解决冲突：

```bash
git diff --name-only --diff-filter=U
```

如果没有输出，说明冲突已解决。

## 6. 验证前端

进入默认前端目录：

```bash
cd /Users/micahzheng/projects/new-api/web/default
```

运行类型检查：

```bash
bun run typecheck
```

如果通过，再回到项目根目录：

```bash
cd /Users/micahzheng/projects/new-api
```

如果失败：

- 优先修复与你刚刚合并冲突相关的错误。
- 如果错误来自明显无关文件，先记录下来，不要随意扩大修改范围。

## 7. 完成 merge commit

冲突解决且检查通过后：

```bash
git commit --no-edit
```

查看最终状态：

```bash
git status --short --branch
```

理想状态：

```text
## private/custom-ui
```

没有额外 modified 文件。

查看当前分支领先上游的 commit：

```bash
git log --oneline origin/main..HEAD
```

通常会看到：

- 你的私人化 commit
- 合并上游的 merge commit

## 8. 推送到自己的 fork

只有确认无误后，才推送到自己的 fork：

```bash
git push -u fork private/custom-ui
```

不要执行：

```bash
git push origin private/custom-ui
```

因为 `origin` 是上游项目，不是你的私人仓库。

## 9. 发布或部署建议

如果服务器从你的 fork 拉代码，建议部署分支使用：

```text
private/custom-ui
```

或者你也可以在 fork 上建立长期分支：

```text
custom/main
```

后续流程固定为：

```bash
git switch private/custom-ui
git fetch origin
git merge origin/main
cd web/default && bun run typecheck
cd ../..
git push fork private/custom-ui
```

## 10. 常见问题

### 问：`git commit` 会不会提交到上游？

不会。`git commit` 只是在本地创建提交。

### 问：什么命令会上传？

`git push` 才会上传。

### 问：怎么确认当前分支有没有绑定远端？

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u}
```

如果没有输出或报错，说明没有绑定 upstream。

### 问：怎么确认不会推到上游？

推送时明确写 `fork`：

```bash
git push fork 分支名
```

不要写 `origin`。

### 问：上游合并了我之前的 PR，为什么本地还显示文件 modified？

通常是因为本地分支落后上游。先确认差异：

```bash
git diff origin/main -- 文件路径
```

如果没有输出，说明这个文件与上游一致，后续合并 `origin/main` 后会自然消失。

## 11. 当前项目的定制重点

当前建议把私人化内容集中在：

```text
web/default/src/custom/site.ts
```

目前包含：

- 侧边栏私人链接，例如“Model Square”“Status Monitor”
- 顶部导航私人链接，例如“Status Monitor”
- 充值金额 CNY 格式化

后续新增私人化内容时，优先考虑加到：

```text
web/default/src/custom/
```

避免直接大面积修改上游核心组件。


---

## 12. 服务器容器部署流程

适用场景：本地 `private/custom-ui` 已经同步上游并验证通过，需要部署到 Oracle Singapore 服务器上的生产容器。

### 12.1 部署前确认

本地确认当前分支：

```bash
cd /Users/micahzheng/projects/new-api
git status --short --branch
```

应处于：

```text
## private/custom-ui
```

确认当前分支包含最新上游：

```bash
git fetch origin
git merge-base --is-ancestor origin/main HEAD && echo yes || echo no
```

输出应为：

```text
yes
```

运行前端检查：

```bash
cd /Users/micahzheng/projects/new-api/web/default
bun run typecheck
```

### 12.2 推送到自己的 fork

部署服务器需要能拉到你的定制分支，因此推送到 `fork`：

```bash
cd /Users/micahzheng/projects/new-api
git push -u fork private/custom-ui
```

不要推送到 `origin`：

```bash
# 不要执行
git push origin private/custom-ui
```

### 12.3 使用 1Password SSH 信息连接服务器

1Password 条目：

```text
Oracle Singapore (Tailscale SSH)
```

该条目包含：

- DNS
- IP
- 用户名
- SSH 私钥

安全原则：

- 不要把私钥、token、密码打印到终端日志。
- 如果需要临时私钥文件，用完立刻删除。
- 使用 1Password CLI 读取时优先用 item id / field id，避免标题里的括号影响 secret reference。

### 12.4 当前服务器生产部署信息

生产 compose 目录：

```text
/opt/new-api
```

生产服务：

```text
new-api
```

数据库服务：

```text
new-api-postgres
```

生产端口映射：

```text
127.0.0.1:33030 -> 3000
```

当前部署方式：

- 在服务器新建干净源码目录。
- 从你的 fork 拉取 `private/custom-ui`。
- 在服务器本地构建 Docker 镜像。
- 修改 `/opt/new-api/docker-compose.yml` 中 `new-api` 服务的 image。
- `docker compose up -d new-api` 重启服务。

### 12.5 推荐部署命令模板

以下命令应在服务器上执行：

```bash
set -euo pipefail

BUILD_DIR="$HOME/new-api-custom-ui-src"
BRANCH="private/custom-ui"
REPO="https://github.com/Micah-Zheng/new-api.git"
IMAGE="new-api:custom-ui-$(date +%Y%m%d%H%M%S)"

if [ ! -d "$BUILD_DIR/.git" ]; then
  rm -rf "$BUILD_DIR"
  git clone --branch "$BRANCH" --single-branch "$REPO" "$BUILD_DIR"
else
  git -C "$BUILD_DIR" fetch origin "$BRANCH"
  git -C "$BUILD_DIR" switch "$BRANCH" || git -C "$BUILD_DIR" checkout "$BRANCH"
  git -C "$BUILD_DIR" reset --hard "origin/$BRANCH"
fi

cd "$BUILD_DIR"
git rev-parse --short HEAD
docker build -t "$IMAGE" .
echo "$IMAGE" > "$HOME/.new-api-last-custom-image"
```

> **关于 `--no-cache`**：正常部署**不要加** `--no-cache`。Docker 会自动复用未变化的层（依赖安装、Go 编译等），只重建真正改动的部分。
>
> 只有以下情况才需要 `--no-cache`：
> - 怀疑 Docker 缓存损坏导致构建结果不正确
> - 需要强制拉取最新基础镜像（安全更新等）
>
> 频繁使用 `--no-cache` 会导致每次构建产生 10GB+ 的 build cache，快速占满磁盘。

然后更新生产 compose：

```bash
set -euo pipefail

IMAGE=$(cat "$HOME/.new-api-last-custom-image")
cd /opt/new-api

BACKUP="docker-compose.yml.backup-$(date +%Y%m%d%H%M%S)"
sudo cp docker-compose.yml "$BACKUP"

echo "backup=/opt/new-api/$BACKUP"
echo "deploy_image=$IMAGE"

sudo python3 - <<PY
from pathlib import Path
image = "$IMAGE"
path = Path("docker-compose.yml")
text = path.read_text()
lines = text.splitlines()
for idx, line in enumerate(lines):
    if line.strip().startswith("image:") and "new-api" in line:
        lines[idx] = f"    image: {image}"
        break
else:
    raise SystemExit("new-api image line not found")
path.write_text("\n".join(lines) + "\n")
PY

sudo docker compose up -d new-api
```

### 12.6 部署后验证

查看容器状态：

```bash
docker ps --filter name=^new-api$ --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

检查健康状态：

```bash
docker inspect new-api --format "image={{.Config.Image}} status={{.State.Status}} health={{if .State.Health}}{{.State.Health.Status}}{{end}} started={{.State.StartedAt}}"
```

检查 API：

```bash
wget -qO- http://127.0.0.1:33030/api/status | head -c 500; echo
```

查看日志：

```bash
docker logs --tail 80 new-api
```

正常结果：

- 容器 `new-api` 为 `Up`
- health 为 `healthy`
- `/api/status` 返回 JSON
- 日志没有持续报错

### 12.7 回滚

每次部署前都会备份：

```text
/opt/new-api/docker-compose.yml.backup-时间戳
```

回滚命令：

```bash
cd /opt/new-api
sudo cp docker-compose.yml.backup-时间戳 docker-compose.yml
sudo docker compose up -d new-api
```

例如：

```bash
cd /opt/new-api
sudo cp docker-compose.yml.backup-20260430021724 docker-compose.yml
sudo docker compose up -d new-api
```

---

## 13. GitHub 上出现 “had recent pushes” 怎么办

当你把 `private/custom-ui` 推到自己的 fork 后，GitHub 可能显示：

```text
private/custom-ui had recent pushes
```

这只是 GitHub 提醒：这个分支最近被 push 了，是否要创建 PR。

这不代表：

- 已经合并到主分支。
- 已经提交到上游。
- 已经创建 PR。
- 已经影响 `main`。

如果不想创建 PR，直接忽略即可，不要点 “Compare & pull request”。

### 13.1 如果完全不想 GitHub 上保留该分支

可以删除 fork 上的远端分支：

```bash
git push fork --delete private/custom-ui
```

注意：删除后，服务器后续无法直接从 GitHub 拉这个分支更新。已经部署的容器不会立刻受影响，但后续部署会不方便。

### 13.2 更推荐的做法

保留 `fork/private/custom-ui` 作为私人部署分支，不开 PR。

当前 `private/custom-ui` 已经是推荐的私人部署分支名，不需要再改名。

---

## 14. 给上游提交 bugfix PR 的正确流程

适用场景：你发现了一个通用 bug，修复后希望提交给上游 `QuantumNous/new-api`。

关键原则：

- 不要从 `private/custom-ui` 开 PR。
- 不要把私人化定制混进上游 PR。
- 从最新 `origin/main` 新建干净 bugfix 分支。
- 每个 PR 只包含一个清晰 bugfix。
- 提交需要带 `Signed-off-by` 签名。

### 14.1 新建干净 bugfix 分支

```bash
cd /Users/micahzheng/projects/new-api

git fetch origin
git switch main
git merge origin/main
git switch -c fix/some-bug
```

如果本地 `main` 有你不想要的改动，先不要继续，检查：

```bash
git status --short --branch
```

理想状态是干净的。

### 14.2 修改 bug 并验证

只改 bug 相关文件。

如果是前端：

```bash
cd /Users/micahzheng/projects/new-api/web/default
bun run typecheck
bun run build
```

如果是后端：

```bash
cd /Users/micahzheng/projects/new-api
go test ./...
```

实际测试命令以改动范围为准，优先跑最快相关检查。

### 14.3 提交时带 DCO 签名

大多数开源项目说的“签名”通常是 DCO `Signed-off-by`。

使用：

```bash
git add 相关文件
git commit -s -m "fix: describe the bug"
```

`-s` 会在 commit message 末尾自动添加：

```text
Signed-off-by: Your Name <your@email>
```

如果项目要求 GPG/SSH verified signature，则使用：

```bash
git commit -S -s -m "fix: describe the bug"
```

其中：

- `-s` 是 DCO Signed-off-by。
- `-S` 是加密签名，GitHub 上通常显示 Verified。

不要把 `-s` 和 `-S` 混淆。

### 14.4 推送 bugfix 分支到自己的 fork

```bash
git push -u fork fix/some-bug
```

不要推到上游 `origin`。

### 14.5 在 GitHub 创建 PR

GitHub PR 方向应该是：

```text
base repository: QuantumNous/new-api
base branch: main
compare repository: Micah-Zheng/new-api
compare branch: fix/some-bug
```

PR 描述建议包含：

- Bug 现象
- 复现步骤
- 修复方式
- 测试结果
- 是否影响数据库/配置/兼容性

### 14.6 PR 前自检

确认 PR 不包含私人化提交：

```bash
git log --oneline origin/main..HEAD
```

这里应该只看到 bugfix 相关 commit，不应该看到：

```text
customize frontend UI overrides
Merge remote-tracking branch 'origin/main' into private/custom-ui
```

确认 diff 范围：

```bash
git diff --stat origin/main...HEAD
```

确认没有私人化内容：

```bash
git diff origin/main...HEAD -- web/default/src/custom web/default/src/hooks/use-sidebar-data.ts web/default/src/features/wallet || true
```

如果 bug 本来就改这些文件，则人工确认 diff 只包含通用 bugfix，而不是私人品牌/导航/钱包定制。

---

## 15. 日常推荐分支模型

长期保持三类分支：

```text
main                      # 跟随上游 origin/main，不放私人化
private/custom-ui         # 私人定制部署分支，不 PR 到上游
fix/*                     # 给上游 PR 的干净 bugfix 分支
```

注意：分支名不要包含 `codex`，避免 GitHub 页面、PR、分支列表中出现不想公开展示的工具来源信息。

不再使用的旧分支名：

```text
codex/custom-ui
codex/fix-default-api-key-group
```

这些旧远端分支已经从 `fork` 删除。

日常同步私人部署分支：

```bash
git switch private/custom-ui
git fetch origin
git merge origin/main
cd web/default && bun run typecheck
cd ../..
git push fork private/custom-ui
```

服务器部署脚本中的分支名也统一使用：

```bash
BRANCH="private/custom-ui"
```

不要再使用：

```bash
BRANCH="codex/custom-ui"
```

如果服务器构建目录还在旧分支，切到新分支：

```bash
BUILD_DIR="$HOME/new-api-custom-ui-src"

git -C "$BUILD_DIR" fetch origin private/custom-ui:refs/remotes/origin/private/custom-ui
git -C "$BUILD_DIR" switch -C private/custom-ui refs/remotes/origin/private/custom-ui
git -C "$BUILD_DIR" status --short --branch
```

日常给上游修 bug：

```bash
git fetch origin
git switch main
git merge origin/main
git switch -c fix/some-bug
# 修改 bug
git commit -S -s -m "fix: describe the bug"
git push -u fork fix/some-bug
```

私人部署分支和上游 PR 分支必须隔离。上游 PR 分支只包含通用 bugfix，不包含私人定制。

如果误用了不合适的分支名，改名流程：

```bash
git branch -m 旧分支名 新分支名
git push -u fork 新分支名
git push fork --delete 旧分支名
```

检查 fork 上是否还有 `codex/*` 分支：

```bash
git ls-remote --heads fork 'codex/*'
```

如果没有输出，说明 fork 上已经没有 `codex/*` 分支。
