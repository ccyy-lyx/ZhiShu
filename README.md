# 智枢

智枢是基于 OpenClaw Mission Control 的二开版本库，用来做多 Agent 的治理与调度中枢。

## 默认端口

- 前端 WebUI 默认端口是 33000
- 后端 API 默认端口是 38000

## 本地原生启动

后端

```bash
cd backend
cp .env.example .env
uv sync --extra dev
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 38000
```

前端

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

访问地址

- WebUI http://localhost:33000
- API http://localhost:38000/healthz

## 两种访问模式（重要）

智枢支持两种常见的访问/认证方式：

### 模式 A：直连端口访问（开发/测试）

- 直接访问 `http://<公网IP>:33000`（或内网 IP）
- 一般 **需要在页面里输入 local token**（Local Authentication 页面）

适合：临时调试、内网环境、个人使用。

### 模式 B：域名 + OpenResty 反代（推荐对外）

目标：用户只输入 **BasicAuth 账号密码**，不再需要输入长 token。

要点：
1) OpenResty 用 BasicAuth 保护整站
2) OpenResty 在转发 `/api/*` 时 **注入** `Authorization: Bearer <LOCAL_AUTH_TOKEN>`
3) 前端启用 `NEXT_PUBLIC_PROXY_AUTH=true`，在 local 模式下跳过/隐藏 token 登录页

> 安全提示：这种“注入 token”本质上是 **全站共享一个管理员身份**。
> 必须确保 BasicAuth/Access/WAF 等外层保护是开启的。

#### 前端配置（无感 token）

在 `frontend/.env.local`（本地 dev）或前端启动环境变量中设置：

```bash
NEXT_PUBLIC_AUTH_MODE=local
NEXT_PUBLIC_API_URL=https://<你的域名>
NEXT_PUBLIC_PROXY_AUTH=true
```

#### OpenResty 配置片段（示例）

下面示例假设：
- 前端 Next dev / Node 服务在：`127.0.0.1:33000`
- 后端 FastAPI 在：`127.0.0.1:38000`

**站点 server 中启用 BasicAuth：**

```nginx
# BasicAuth
auth_basic "Authentication";
auth_basic_user_file /www/sites/<domain>/auth_basic/auth.pass;
```

**转发规则：前端走 33000，后端 /api 走 38000，并注入 token：**

```nginx
# 前端
location ^~ / {
  proxy_pass http://127.0.0.1:33000;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Port $server_port;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection $http_connection;
}

# 后端 API（注入 token）
location ^~ /api/ {
  proxy_pass http://127.0.0.1:38000;

  # 关键：注入 local-auth token（服务端加，不暴露给浏览器）
  proxy_set_header Authorization "Bearer <LOCAL_AUTH_TOKEN>";

  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
  proxy_set_header X-Forwarded-Port $server_port;
  proxy_http_version 1.1;
}

# 可选：健康检查/文档
location = /healthz { proxy_pass http://127.0.0.1:38000/healthz; }
location = /readyz { proxy_pass http://127.0.0.1:38000/readyz; }
location = /openapi.json { proxy_pass http://127.0.0.1:38000/openapi.json; }
```

> 建议把 `<LOCAL_AUTH_TOKEN>` 放到 OpenResty 的独立 include 文件里（例如 `00_mc_token.conf`），避免散落多处，方便后期轮换。

#### 快速验证

- BasicAuth 是否生效：访问 `https://<domain>/` 应弹窗
- 后端是否通：
  - `https://<domain>/healthz` 返回 `{"ok":true}`
  - 进入页面后不再出现 token 输入页

## 说明

- 本仓库会按需同步上游更新
- 同步时会先建分支，方便回滚
