"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import {
  SignInButton,
  SignedIn,
  SignedOut,
  isClerkEnabled,
} from "@/auth/clerk";

import { UserMenu } from "@/components/organisms/UserMenu";

export function LandingShell({ children }: { children: ReactNode }) {
  const clerkEnabled = isClerkEnabled();

  return (
    <div className="landing-enterprise">
      <nav className="landing-nav" aria-label="主导航">
        <div className="nav-container">
          <Link href="/" className="logo-section" aria-label="打开 OpenClaw 首页">
            <div className="logo-icon" aria-hidden="true">
              OC
            </div>
            <div className="logo-text">
              <div className="logo-name">OpenClaw</div>
              <div className="logo-tagline">任务指挥中心</div>
            </div>
          </Link>

          <div className="nav-links">
            <Link href="#capabilities">能力</Link>
            <Link href="/boards">看板</Link>
            <Link href="/activity">动态</Link>
            <Link href="/gateways">网关</Link>
          </div>

          <div className="nav-cta">
            <SignedOut>
              {clerkEnabled ? (
                <>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/onboarding"
                    signUpForceRedirectUrl="/onboarding"
                  >
                    <button type="button" className="btn-secondary">
                      登录
                    </button>
                  </SignInButton>
                  <SignInButton
                    mode="modal"
                    forceRedirectUrl="/onboarding"
                    signUpForceRedirectUrl="/onboarding"
                  >
                    <button type="button" className="btn-primary">
                      开始免费试用
                    </button>
                  </SignInButton>
                </>
              ) : (
                <>
                  <Link href="/boards" className="btn-secondary">
                    看板
                  </Link>
                  <Link href="/onboarding" className="btn-primary">
                    开始使用
                  </Link>
                </>
              )}
            </SignedOut>

            <SignedIn>
              <Link href="/boards/new" className="btn-secondary">
                创建看板
              </Link>
              <Link href="/boards" className="btn-primary">
                打开看板
              </Link>
              <UserMenu />
            </SignedIn>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>OpenClaw</h3>
            <p>一个平静的指挥中心，用于管理看板、智能体与审批。</p>
            <div className="footer-tagline">实时执行可见性</div>
          </div>

          <div className="footer-column">
            <h4>产品</h4>
            <div className="footer-links">
              <Link href="#capabilities">能力</Link>
              <Link href="/boards">看板</Link>
              <Link href="/activity">动态</Link>
              <Link href="/dashboard">仪表盘</Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>平台</h4>
            <div className="footer-links">
              <Link href="/gateways">网关</Link>
              <Link href="/agents">智能体</Link>
              <Link href="/dashboard">仪表盘</Link>
            </div>
          </div>

          <div className="footer-column">
            <h4>访问</h4>
            <div className="footer-links">
              <SignedOut>
                {clerkEnabled ? (
                  <>
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl="/onboarding"
                      signUpForceRedirectUrl="/onboarding"
                    >
                      <button type="button">登录</button>
                    </SignInButton>
                    <SignInButton
                      mode="modal"
                      forceRedirectUrl="/onboarding"
                      signUpForceRedirectUrl="/onboarding"
                    >
                      <button type="button">创建账户</button>
                    </SignInButton>
                  </>
                ) : (
                  <Link href="/boards">看板</Link>
                )}
                <Link href="/onboarding">引导页</Link>
              </SignedOut>
              <SignedIn>
                <Link href="/boards">打开看板</Link>
                <Link href="/boards/new">创建看板</Link>
                <Link href="/dashboard">仪表盘</Link>
              </SignedIn>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} OpenClaw。保留所有权利。
          </div>
          <div className="footer-bottom-links">
            <Link href="#capabilities">能力</Link>
            <Link href="/boards">看板</Link>
            <Link href="/activity">动态</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
