"use client";

import Link from "next/link";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  isClerkEnabled,
} from "@/auth/clerk";

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M6 12L10 8L6 4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export function LandingHero() {
  const clerkEnabled = isClerkEnabled();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className="hero-label">OpenClaw 任务指挥中心</div>
          <h1>
            指挥 <span className="hero-highlight">自治协作。</span>
            <br />
            保持人工监管。
          </h1>
          <p>
            在统一指挥中心追踪任务、审批与智能体健康状态。
            实时感知工作变化，不丢失执行上下文。
          </p>

          <div className="hero-actions">
            <SignedOut>
              {clerkEnabled ? (
                <>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/boards"
                    signUpForceRedirectUrl="/boards"
                  >
                    <button type="button" className="btn-large primary">
                      打开看板 <ArrowIcon />
                    </button>
                  </SignInButton>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/boards/new"
                    signUpForceRedirectUrl="/boards/new"
                  >
                    <button type="button" className="btn-large secondary">
                      创建看板
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/boards" className="btn-large primary">
                    打开看板 <ArrowIcon />
                  </Link>
                  <Link href="/boards/new" className="btn-large secondary">
                    创建看板
                  </Link>
                </>
              )}
            </SignedOut>

            <SignedIn>
              <Link href="/boards" className="btn-large primary">
                打开看板 <ArrowIcon />
              </Link>
              <Link href="/boards/new" className="btn-large secondary">
                创建看板
              </Link>
            </SignedIn>
          </div>

          <div className="hero-features">
            {["智能体优先运营", "审批队列", "实时信号"].map((label) => (
              <div key={label} className="hero-feature">
                <div className="feature-icon">✓</div>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="command-surface">
          <div className="surface-header">
            <div className="surface-title">指挥界面</div>
            <div className="live-indicator">
              <div className="live-dot" />
              实时
            </div>
          </div>
          <div className="surface-subtitle">
            <h3>交付工作，不丢失上下文。</h3>
            <p>任务、审批与智能体状态在看板中保持同步。</p>
          </div>
          <div className="metrics-row">
            {[
              { label: "看板", value: "12" },
              { label: "智能体", value: "08" },
              { label: "任务", value: "46" },
            ].map((item) => (
              <div key={item.label} className="metric">
                <div className="metric-value">{item.value}</div>
                <div className="metric-label">{item.label}</div>
              </div>
            ))}
          </div>
          <div className="surface-content">
            <div className="content-section">
              <h4>看板 — 进行中</h4>
              {["切割发布候选", "清理审批积压", "稳定智能体交接"].map((title) => (
                <div key={title} className="status-item">
                  <div className="status-icon progress">⊙</div>
                  <div className="status-item-content">
                    <div className="status-item-title">{title}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="content-section">
              <h4>审批 — 待处理 3 项</h4>
              {[
                { title: "已确认部署窗口", status: "ready" as const },
                { title: "文案已审阅", status: "waiting" as const },
                { title: "安全签核", status: "waiting" as const },
              ].map((item) => (
                <div key={item.title} className="approval-item">
                  <div className="approval-title">{item.title}</div>
                  <div className={`approval-badge ${item.status}`}>
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              padding: "2rem",
              borderTop: "1px solid var(--neutral-200)",
            }}
          >
            <div className="content-section">
              <h4>信号 — 刚刚更新</h4>
              {[
                { text: "智能体 Delta 已将任务移至审核", time: "现在" },
                { text: "增长运营触达 WIP 上限", time: "5 分钟前" },
                { text: "发布流水线已稳定", time: "12 分钟前" },
              ].map((signal) => (
                <div key={signal.text} className="signal-item">
                  <div className="signal-text">{signal.text}</div>
                  <div className="signal-time">{signal.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="features-section" id="capabilities">
        <div className="features-grid">
          {[
            {
              title: "把看板当作运营地图",
              description:
                "任务、优先级、依赖关系和负责人一目了然。",
            },
            {
              title: "可推进的审批流",
              description:
                "排队、评论、审批不丢上下文，也不拖慢执行。",
            },
            {
              title: "实时信号",
              description:
                "工作变化即时可见：任务、智能体状态和审批实时更新。",
            },
            {
              title: "内建审计轨迹",
              description:
                "每次决策都可追溯，让看板可解释、可复盘。",
            },
          ].map((feature, idx) => (
            <div key={feature.title} className="feature-card">
              <div className="feature-number">
                {String(idx + 1).padStart(2, "0")}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>从一个看板开始，扩展为指挥中枢。</h2>
          <p>
            创建看板，指定负责智能体，并从第一天起保持审批与信号可见。
          </p>
          <div className="cta-actions">
            <SignedOut>
              {clerkEnabled ? (
                <>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/boards/new"
                    signUpForceRedirectUrl="/boards/new"
                  >
                    <button type="button" className="btn-large white">
                      创建看板
                    </button>
                  </SignInButton>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/boards"
                    signUpForceRedirectUrl="/boards"
                  >
                    <button type="button" className="btn-large outline">
                      查看看板
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/boards/new" className="btn-large white">
                    创建看板
                  </Link>
                  <Link href="/boards" className="btn-large outline">
                    查看看板
                  </Link>
                </>
              )}
            </SignedOut>

            <SignedIn>
              <Link href="/boards/new" className="btn-large white">
                创建看板
              </Link>
              <Link href="/boards" className="btn-large outline">
                查看看板
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>
    </>
  );
}
