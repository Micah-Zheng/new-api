# check-cx 部署指南

## 架构概览

```
Internet
  │
  ▼
Cloudflare Tunnel (tcp.red)
  ├── check.tcp.red      → 服务器:3000 (check-cx 面板)
  └── check-admin.tcp.red → 服务器:3001 (check-cx-admin 后台)
  
服务器 Docker
  ├── check-cx        (port 3000)  ─┐
  ├── check-cx-admin  (port 3001)  ─┤── 共用 Supabase 云数据库
  └── cloudflared                  ─┘
```

---

## 第一步：创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) → New Project
2. 记录以下三个值（Project Settings → API）：
   - `Project URL`（即 `SUPABASE_URL`）
   - `anon public` key（即 `SUPABASE_PUBLISHABLE_OR_ANON_KEY`）
   - `service_role` key（即 `SUPABASE_SERVICE_ROLE_KEY`，**保密**）

3. 在 Supabase 控制台 → **SQL Editor** 中执行数据库初始化：
   - 先执行 check-cx 仓库中的 `supabase/schema.sql`
     ```
     # 下载 schema.sql
     curl -O https://raw.githubusercontent.com/BingZi-233/check-cx/master/supabase/schema.sql
     ```
   - 在 SQL Editor 粘贴内容执行

---

## 第二步：配置 GitHub OAuth（用于 check-cx-admin 登录）

1. 访问 GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. 填写：
   - Application name: `check-cx-admin`
   - Homepage URL: `https://check-admin.tcp.red`
   - Authorization callback URL: `https://check-admin.tcp.red/auth/callback`（**先留空，后面填**）
3. 记录 `Client ID` 和 `Client Secret`

4. 在 Supabase 控制台 → Authentication → Providers → GitHub：
   - 启用 GitHub
   - 填入 Client ID 和 Client Secret
   - 将 Supabase 提供的 Callback URL 复制回 GitHub OAuth App

5. 在 Supabase → Authentication → URL Configuration → Redirect URLs 添加：
   ```
   https://check-admin.tcp.red/auth/callback
   ```

---

## 第三步：创建 Cloudflare Tunnel

1. 访问 [Cloudflare Zero Trust](https://one.dash.cloudflare.com) → Networks → Tunnels → Create a tunnel
2. 选择 Cloudflared → 命名为 `check-cx`
3. 复制 Tunnel Token（格式：`eyJhIjoixx...`）
4. 配置 Public Hostnames：

   | Subdomain    | Domain  | Service                    |
   |-------------|---------|----------------------------|
   | check       | tcp.red | http://check-cx:3000       |
   | check-admin | tcp.red | http://check-cx-admin:3000 |

   > ⚠️ Service 地址用 Docker 容器名，因为 cloudflared 和两个服务在同一个 Docker 网络里

---

## 第四步：上传配置文件到服务器

```bash
# 在本地执行，将 check-cx-deploy 目录上传到服务器
scp -r check-cx-deploy ubuntu@你的服务器IP:/home/ubuntu/check-cx

# SSH 进入服务器
ssh ubuntu@你的服务器IP
cd /home/ubuntu/check-cx
```

---

## 第五步：配置环境变量

```bash
# 复制模板
cp .env.example .env
cp .env.check-cx.example .env.check-cx
cp .env.check-cx-admin.example .env.check-cx-admin

# 编辑各文件，填入真实值
nano .env                  # 填 CLOUDFLARE_TUNNEL_TOKEN
nano .env.check-cx         # 填 Supabase 三个 key
nano .env.check-cx-admin   # 填 Supabase 三个 key + ADMIN_EMAILS
```

---

## 第六步：读取 relay-pulse 现有监控配置

```bash
# 在服务器上执行
bash /home/ubuntu/check-cx/read-relay-pulse-monitors.sh
```

将输出的配置内容告知 Kiro，自动生成对应的 SQL 导入语句。

---

## 第七步：初始化监控数据

1. 编辑 `init-monitors.sql`，将 `REPLACE_WITH_YOUR_*_KEY` 替换为真实 API Key
2. 在 Supabase SQL Editor 中执行 `init-monitors.sql`

---

## 第八步：启动服务

```bash
cd /home/ubuntu/check-cx

# 拉取镜像并启动
docker compose pull
docker compose up -d

# 查看日志
docker compose logs -f
```

---

## 第九步：首次登录 check-cx-admin

1. 访问 `https://check-admin.tcp.red`
2. 点击 GitHub 登录
3. 使用 `ADMIN_EMAILS` 中配置的邮箱对应的 GitHub 账号登录
4. 登录后进入 `/dashboard/configs` 补充各监控项的 API Key

---

## 访问地址

| 服务 | 地址 |
|------|------|
| 面板（公开） | https://check.tcp.red |
| 后台管理 | https://check-admin.tcp.red |

---

## 常用命令

```bash
# 查看运行状态
docker compose ps

# 查看面板日志
docker compose logs -f check-cx

# 查看后台日志
docker compose logs -f check-cx-admin

# 重启服务
docker compose restart

# 更新镜像
docker compose pull && docker compose up -d
```

---

## 从 relay-pulse monitors.d 迁移说明

relay-pulse 的配置格式：
```yaml
monitors:
  - provider: "服务商名"
    service: "cc"
    base_url: "https://api.example.com"
    template: "cc-haiku-arith"
    api_key: "sk-xxx"
```

对应 check-cx 的配置：
- `provider` + `service` → `check_configs.name`（显示名称）
- `base_url` + `/v1/chat/completions` → `check_configs.endpoint`
- `api_key` → `check_configs.api_key`
- `template` 中的模型名 → `check_models.model`（需先在 check_models 中创建）
- `provider` → `check_configs.group_name`（分组）

check-cx 的 type 映射：
- 所有走 `/v1/chat/completions` 的接口 → `openai`
- 走 `/v1/messages` 的 Anthropic 原生接口 → `anthropic`
- 走 Gemini 原生接口 → `gemini`
