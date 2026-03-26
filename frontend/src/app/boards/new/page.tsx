"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/clerk";

import { ApiError } from "@/api/mutator";
import { useCreateBoardApiV1BoardsPost } from "@/api/generated/boards/boards";
import {
  type listBoardGroupsApiV1BoardGroupsGetResponse,
  useListBoardGroupsApiV1BoardGroupsGet,
} from "@/api/generated/board-groups/board-groups";
import {
  type listGatewaysApiV1GatewaysGetResponse,
  useListGatewaysApiV1GatewaysGet,
} from "@/api/generated/gateways/gateways";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import type { BoardGroupRead } from "@/api/generated/model";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchableSelect from "@/components/ui/searchable-select";
import { Textarea } from "@/components/ui/textarea";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "board";

export default function NewBoardPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const { isAdmin } = useOrganizationMembership(isSignedIn);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gatewayId, setGatewayId] = useState<string>("");
  const [boardGroupId, setBoardGroupId] = useState<string>("none");

  const [error, setError] = useState<string | null>(null);

  const gatewaysQuery = useListGatewaysApiV1GatewaysGet<
    listGatewaysApiV1GatewaysGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn && isAdmin),
      refetchOnMount: "always",
      retry: false,
    },
  });

  const groupsQuery = useListBoardGroupsApiV1BoardGroupsGet<
    listBoardGroupsApiV1BoardGroupsGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn && isAdmin),
      refetchOnMount: "always",
      retry: false,
    },
  });

  const createBoardMutation = useCreateBoardApiV1BoardsPost<ApiError>({
    mutation: {
      onSuccess: (result) => {
        if (result.status === 200) {
          router.push(`/boards/${result.data.id}/edit?onboarding=1`);
        }
      },
      onError: (err) => {
        setError(err.message || "发生了错误。");
      },
    },
  });

  const gateways = useMemo(() => {
    if (gatewaysQuery.data?.status !== 200) return [];
    return gatewaysQuery.data.data.items ?? [];
  }, [gatewaysQuery.data]);
  const groups = useMemo<BoardGroupRead[]>(() => {
    if (groupsQuery.data?.status !== 200) return [];
    return groupsQuery.data.data.items ?? [];
  }, [groupsQuery.data]);
  const displayGatewayId = gatewayId || gateways[0]?.id || "";
  const isLoading =
    gatewaysQuery.isLoading ||
    groupsQuery.isLoading ||
    createBoardMutation.isPending;
  const errorMessage =
    error ?? gatewaysQuery.error?.message ?? groupsQuery.error?.message ?? null;

  const isFormReady = Boolean(
    name.trim() && description.trim() && displayGatewayId,
  );

  const gatewayOptions = useMemo(
    () =>
      gateways.map((gateway) => ({ value: gateway.id, label: gateway.name })),
    [gateways],
  );

  const groupOptions = useMemo(
    () => [
      { value: "none", label: "不分组" },
      ...groups.map((group) => ({ value: group.id, label: group.name })),
    ],
    [groups],
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isSignedIn) return;
    const trimmedName = name.trim();
    const resolvedGatewayId = displayGatewayId;
    if (!trimmedName) {
      setError("请输入看板名称。");
      return;
    }
    if (!resolvedGatewayId) {
      setError("创建看板前请选择一个网关。");
      return;
    }
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError("请输入看板描述。");
      return;
    }

    setError(null);

    createBoardMutation.mutate({
      data: {
        name: trimmedName,
        slug: slugify(trimmedName),
        description: trimmedDescription,
        gateway_id: resolvedGatewayId,
        board_group_id: boardGroupId === "none" ? null : boardGroupId,
      },
    });
  };

  return (
    <DashboardPageLayout
      signedOut={{
        message: "登录后才能创建看板。",
        forceRedirectUrl: "/boards/new",
        signUpForceRedirectUrl: "/boards/new",
      }}
      title="创建看板"
      description="看板用于按任务目标组织任务与智能体。"
      isAdmin={isAdmin}
      adminOnlyMessage="只有组织所有者和管理员可以创建看板。"
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                看板名称 <span className="text-red-500">*</span>
              </label>
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="例如：发布运维"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                网关 <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                ariaLabel="选择网关"
                value={displayGatewayId}
                onValueChange={setGatewayId}
                options={gatewayOptions}
                placeholder="选择网关"
                searchPlaceholder="搜索网关…"
                emptyMessage="未找到网关。"
                triggerClassName="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                contentClassName="rounded-xl border border-slate-200 shadow-lg"
                itemClassName="px-4 py-3 text-sm text-slate-700 data-[selected=true]:bg-slate-50 data-[selected=true]:text-slate-900"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-900">
                看板分组
              </label>
              <SearchableSelect
                ariaLabel="选择分组"
                value={boardGroupId}
                onValueChange={setBoardGroupId}
                options={groupOptions}
                placeholder="不分组"
                searchPlaceholder="搜索分组…"
                emptyMessage="未找到分组。"
                triggerClassName="w-full h-11 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                contentClassName="rounded-xl border border-slate-200 shadow-lg"
                itemClassName="px-4 py-3 text-sm text-slate-700 data-[selected=true]:bg-slate-50 data-[selected=true]:text-slate-900"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500">
                可选。分组可提升跨看板的可见性。
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              描述 <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="在引导智能体时，有哪些上下文需要提前说明？"
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>
        </div>

        {gateways.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              暂无可用网关。请先在{" "}
              <Link
                href="/gateways"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                网关
              </Link>{" "}
              中创建一个再继续。
            </p>
          </div>
        ) : null}

        {errorMessage ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/boards")}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button type="submit" disabled={isLoading || !isFormReady}>
            {isLoading ? "创建中…" : "创建看板"}
          </Button>
        </div>
      </form>
    </DashboardPageLayout>
  );
}
