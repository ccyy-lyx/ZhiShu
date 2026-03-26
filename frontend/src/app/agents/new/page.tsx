"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/clerk";

import { ApiError } from "@/api/mutator";
import {
  type listBoardsApiV1BoardsGetResponse,
  useListBoardsApiV1BoardsGet,
} from "@/api/generated/boards/boards";
import { useCreateAgentApiV1AgentsPost } from "@/api/generated/agents/agents";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import type { BoardRead } from "@/api/generated/model";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect, {
  type SearchableSelectOption,
} from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AGENT_EMOJI_OPTIONS } from "@/lib/agent-emoji";
import { DEFAULT_IDENTITY_PROFILE } from "@/lib/agent-templates";

type IdentityProfile = {
  role: string;
  communication_style: string;
  emoji: string;
};

const getBoardOptions = (boards: BoardRead[]): SearchableSelectOption[] =>
  boards.map((board) => ({
    value: board.id,
    label: board.name,
  }));

const normalizeIdentityProfile = (
  profile: IdentityProfile,
): IdentityProfile | null => {
  const normalized: IdentityProfile = {
    role: profile.role.trim(),
    communication_style: profile.communication_style.trim(),
    emoji: profile.emoji.trim(),
  };
  const hasValue = Object.values(normalized).some((value) => value.length > 0);
  return hasValue ? normalized : null;
};

export default function NewAgentPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const { isAdmin } = useOrganizationMembership(isSignedIn);

  const [name, setName] = useState("");
  const [boardId, setBoardId] = useState<string>("");
  const [heartbeatEvery, setHeartbeatEvery] = useState("10m");
  const [identityProfile, setIdentityProfile] = useState<IdentityProfile>({
    ...DEFAULT_IDENTITY_PROFILE,
  });
  const [error, setError] = useState<string | null>(null);

  const boardsQuery = useListBoardsApiV1BoardsGet<
    listBoardsApiV1BoardsGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn && isAdmin),
      refetchOnMount: "always",
    },
  });

  const createAgentMutation = useCreateAgentApiV1AgentsPost<ApiError>({
    mutation: {
      onSuccess: (result) => {
        if (result.status === 200) {
          router.push(`/agents/${result.data.id}`);
        }
      },
      onError: (err) => {
        setError(err.message || "操作失败，请稍后重试。");
      },
    },
  });

  const boards =
    boardsQuery.data?.status === 200 ? (boardsQuery.data.data.items ?? []) : [];
  const displayBoardId = boardId || boards[0]?.id || "";
  const isLoading = boardsQuery.isLoading || createAgentMutation.isPending;
  const errorMessage = error ?? boardsQuery.error?.message ?? null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("智能体名称不能为空。");
      return;
    }
    const resolvedBoardId = displayBoardId;
    if (!resolvedBoardId) {
      setError("创建智能体前请先选择看板。");
      return;
    }
    setError(null);
    createAgentMutation.mutate({
      data: {
        name: trimmed,
        board_id: resolvedBoardId,
        heartbeat_config: {
          every: heartbeatEvery.trim() || "10m",
          target: "last",
          includeReasoning: false,
        },
        identity_profile: normalizeIdentityProfile(
          identityProfile,
        ) as unknown as Record<string, unknown> | null,
      },
    });
  };

  return (
    <DashboardPageLayout
      signedOut={{
        message: "请先登录后创建智能体。",
        forceRedirectUrl: "/agents/new",
        signUpForceRedirectUrl: "/agents/new",
      }}
      title="创建智能体"
      description="智能体会先处于预备状态，直到首次心跳上报。"
      isAdmin={isAdmin}
      adminOnlyMessage="仅组织所有者和管理员可以创建智能体。"
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            基础配置
          </p>
          <div className="mt-4 space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  智能体名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例如：部署助手"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  职责
                </label>
                <Input
                  value={identityProfile.role}
                  onChange={(event) =>
                    setIdentityProfile((current) => ({
                      ...current,
                      role: event.target.value,
                    }))
                  }
                  placeholder="例如：创始人、社媒运营"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  看板 <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  ariaLabel="选择看板"
                  value={displayBoardId}
                  onValueChange={setBoardId}
                  options={getBoardOptions(boards)}
                  placeholder="选择看板"
                  searchPlaceholder="搜索看板..."
                  emptyMessage="没有匹配的看板。"
                  triggerClassName="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  contentClassName="rounded-xl border border-slate-200 shadow-lg"
                  itemClassName="px-4 py-3 text-sm text-slate-700 data-[selected=true]:bg-slate-50 data-[selected=true]:text-slate-900"
                  disabled={boards.length === 0}
                />
                {boards.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    请先创建看板，再为智能体分配看板。
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900">
                  表情
                </label>
                <Select
                  value={identityProfile.emoji}
                  onValueChange={(value) =>
                    setIdentityProfile((current) => ({
                      ...current,
                      emoji: value,
                    }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择表情" />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENT_EMOJI_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.glyph} {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            个性与行为
          </p>
          <div className="mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                沟通风格
              </label>
              <Input
                value={identityProfile.communication_style}
                onChange={(event) =>
                  setIdentityProfile((current) => ({
                    ...current,
                    communication_style: event.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            调度与通知
          </p>
          <div className="mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                间隔
              </label>
              <Input
                value={heartbeatEvery}
                onChange={(event) => setHeartbeatEvery(event.target.value)}
                placeholder="例如：10m"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500">
                设置该智能体运行 HEARTBEAT.md 的频率（例如 10m、30m、2h）。
              </p>
            </div>
          </div>
        </div>

        {errorMessage ? (
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 shadow-sm">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "创建中…" : "创建智能体"}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push("/agents")}
          >
            返回智能体列表
          </Button>
        </div>
      </form>
    </DashboardPageLayout>
  );
}
