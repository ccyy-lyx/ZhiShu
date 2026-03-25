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

## 说明

- 本仓库会按需同步上游更新
- 同步时会先建分支，方便回滚
