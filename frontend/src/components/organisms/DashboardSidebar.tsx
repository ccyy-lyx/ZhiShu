"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bot,
  Boxes,
  CheckCircle2,
  Folder,
  Building2,
  LayoutGrid,
  Network,
  Settings,
  Store,
  标签,
} from "lucide-react";

import { useAuth } from "@/auth/clerk";
import { ApiError } from "@/api/mutator";
import { use组织Membership } from "@/lib/use-organization-membership";
import {
  type healthzHealthzGetResponse,
  useHealthzHealthzGet,
} from "@/api/generated/default/default";
import { cn } from "@/lib/utils";

export function 仪表盘Sidebar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { isAdmin } = use组织Membership(isSignedIn);
  const healthQuery = useHealthzHealthzGet<healthzHealthzGetResponse, ApiError>(
    {
      query: {
        refetchInterval: 30_000,
        refetchOnMount: "always",
        retry: false,
      },
      request: { cache: "no-store" },
    },
  );

  const okValue = healthQuery.data?.data?.ok;
  const systemStatus: "unknown" | "operational" | "degraded" =
    okValue === true
      ? "operational"
      : okValue === false
        ? "degraded"
        : healthQuery.isError
          ? "degraded"
          : "unknown";
  const statusLabel =
    systemStatus === "operational"
      ? "系统运行正常"
      : systemStatus === "unknown"
        ? "系统状态不可用"
        : "系统异常";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[280px] -translate-x-full flex-col border-r border-slate-200 bg-white pt-16 shadow-lg transition-transform duration-200 ease-in-out [[data-sidebar=open]_&]:translate-x-0 md:relative md:inset-auto md:z-auto md:w-[260px] md:translate-x-0 md:pt-0 md:shadow-none md:transition-none">
      <div className="flex-1 px-3 py-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          导航
        </p>
        <nav className="mt-3 space-y-4 text-sm">
          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              概览
            </p>
            <div className="mt-1 space-y-1">
              <Link
                href="/dashboard"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname === "/dashboard"
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <BarChart3 className="h-4 w-4" />
                仪表盘
              </Link>
              <Link
                href="/activity"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname.startsWith("/activity")
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <Activity className="h-4 w-4" />
                动态
              </Link>
            </div>
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              看板
            </p>
            <div className="mt-1 space-y-1">
              <Link
                href="/board-groups"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname.startsWith("/board-groups")
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <Folder className="h-4 w-4" />
                看板分组
              </Link>
              <Link
                href="/boards"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname.startsWith("/boards")
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <LayoutGrid className="h-4 w-4" />
                看板
              </Link>
              <Link
                href="/tags"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname.startsWith("/tags")
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <标签 className="h-4 w-4" />
                标签
              </Link>
              <Link
                href="/approvals"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname.startsWith("/approvals")
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                审批
              </Link>
              {isAdmin ? (
                <Link
                  href="/custom-fields"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                    pathname.startsWith("/custom-fields")
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "hover:bg-slate-100",
                  )}
                >
                  <Settings className="h-4 w-4" />
                  自定义字段
                </Link>
              ) : null}
            </div>
          </div>

          <div>
            {isAdmin ? (
              <>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  技能
                </p>
                <div className="mt-1 space-y-1">
                  <Link
                    href="/skills/marketplace"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                      pathname === "/skills" ||
                        pathname.startsWith("/skills/marketplace")
                        ? "bg-blue-100 text-blue-800 font-medium"
                        : "hover:bg-slate-100",
                    )}
                  >
                    <Store className="h-4 w-4" />
                    市场
                  </Link>
                  <Link
                    href="/skills/packs"
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                      pathname.startsWith("/skills/packs")
                        ? "bg-blue-100 text-blue-800 font-medium"
                        : "hover:bg-slate-100",
                    )}
                  >
                    <Boxes className="h-4 w-4" />
                    套件
                  </Link>
                </div>
              </>
            ) : null}
          </div>

          <div>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              管理
            </p>
            <div className="mt-1 space-y-1">
              <Link
                href="/organization"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                  pathname.startsWith("/organization")
                    ? "bg-blue-100 text-blue-800 font-medium"
                    : "hover:bg-slate-100",
                )}
              >
                <Building2 className="h-4 w-4" />
                组织
              </Link>
              {isAdmin ? (
                <Link
                  href="/gateways"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                    pathname.startsWith("/gateways")
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "hover:bg-slate-100",
                  )}
                >
                  <Network className="h-4 w-4" />
                  网关
                </Link>
              ) : null}
              {isAdmin ? (
                <Link
                  href="/agents"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-700 transition",
                    pathname.startsWith("/agents")
                      ? "bg-blue-100 text-blue-800 font-medium"
                      : "hover:bg-slate-100",
                  )}
                >
                  <Bot className="h-4 w-4" />
                  智能体
                </Link>
              ) : null}
            </div>
          </div>
        </nav>
      </div>
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              systemStatus === "operational" && "bg-emerald-500",
              systemStatus === "degraded" && "bg-rose-500",
              systemStatus === "unknown" && "bg-slate-300",
            )}
          />
          {statusLabel}
        </div>
      </div>
    </aside>
  );
}
