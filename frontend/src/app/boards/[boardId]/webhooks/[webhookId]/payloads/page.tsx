"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/auth/clerk";

import { ApiError } from "@/api/mutator";
import {
  type getBoardWebhookApiV1BoardsBoardIdWebhooksWebhookIdGetResponse,
  type listBoardWebhookPayloadsApiV1BoardsBoardIdWebhooksWebhookIdPayloadsGetResponse,
  useGetBoardWebhookApiV1BoardsBoardIdWebhooksWebhookIdGet,
  useListBoardWebhookPayloadsApiV1BoardsBoardIdWebhooksWebhookIdPayloadsGet,
} from "@/api/generated/board-webhooks/board-webhooks";
import type { BoardWebhookPayloadRead } from "@/api/generated/model";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { Button } from "@/components/ui/button";
import { useOrganizationMembership } from "@/lib/use-organization-membership";

const PAGE_LIMIT = 20;

const stringifyPayload = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

export default function WebhookPayloadsPage() {
  const { isSignedIn } = useAuth();
  const { isAdmin } = useOrganizationMembership(isSignedIn);
  const router = useRouter();
  const params = useParams();

  const boardIdParam = params?.boardId;
  const webhookIdParam = params?.webhookId;
  const boardId = Array.isArray(boardIdParam) ? boardIdParam[0] : boardIdParam;
  const webhookId = Array.isArray(webhookIdParam)
    ? webhookIdParam[0]
    : webhookIdParam;

  const [offset, setOffset] = useState(0);

  const webhookQuery = useGetBoardWebhookApiV1BoardsBoardIdWebhooksWebhookIdGet<
    getBoardWebhookApiV1BoardsBoardIdWebhooksWebhookIdGetResponse,
    ApiError
  >(boardId ?? "", webhookId ?? "", {
    query: {
      enabled: Boolean(isSignedIn && isAdmin && boardId && webhookId),
      refetchOnMount: "always",
      retry: false,
    },
  });

  const payloadsQuery =
    useListBoardWebhookPayloadsApiV1BoardsBoardIdWebhooksWebhookIdPayloadsGet<
      listBoardWebhookPayloadsApiV1BoardsBoardIdWebhooksWebhookIdPayloadsGetResponse,
      ApiError
    >(
      boardId ?? "",
      webhookId ?? "",
      { limit: PAGE_LIMIT, offset },
      {
        query: {
          enabled: Boolean(isSignedIn && isAdmin && boardId && webhookId),
          refetchOnMount: "always",
          retry: false,
        },
      },
    );

  const webhook =
    webhookQuery.data?.status === 200 ? webhookQuery.data.data : null;
  const payloadPage =
    payloadsQuery.data?.status === 200 ? payloadsQuery.data.data : null;
  const payloads = payloadPage?.items ?? [];

  const total = payloadPage?.total ?? 0;
  const currentPage = Math.floor(offset / PAGE_LIMIT) + 1;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_LIMIT));
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_LIMIT < total;

  const errorMessage =
    payloadsQuery.error?.message ?? webhookQuery.error?.message ?? null;
  const isLoading = payloadsQuery.isLoading || webhookQuery.isLoading;

  const payloadTitle = useMemo(() => {
    if (!webhook) return "Webhook 载荷";
    return `Webhook ${webhook.id.slice(0, 8)} 载荷`;
  }, [webhook]);

  return (
    <DashboardPageLayout
      signedOut={{
        message: "请先登录后查看 Webhook 载荷。",
        forceRedirectUrl: `/boards/${boardId}/webhooks/${webhookId}/payloads`,
        signUpForceRedirectUrl: `/boards/${boardId}/webhooks/${webhookId}/payloads`,
      }}
      title="Webhook 载荷"
      description="查看此 Webhook 接收到的请求载荷。"
      isAdmin={isAdmin}
      adminOnlyMessage="仅组织所有者和管理员可以查看 Webhook 载荷。"
    >
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-900">
              {payloadTitle}
            </h2>
            <p className="text-sm text-slate-600">
              {webhook?.description ?? "正在加载 Webhook 详情..."}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/boards/${boardId}/edit`)}
          >
            返回看板设置
          </Button>
        </div>

        {webhook ? (
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <code className="break-all text-xs text-slate-700">
              {webhook.endpoint_url ?? webhook.endpoint_path}
            </code>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <p className="text-sm text-slate-700">共 {total} 条载荷</p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                setOffset((current) => Math.max(0, current - PAGE_LIMIT))
              }
              disabled={!hasPrev || isLoading}
            >
              上一页
            </Button>
            <span className="text-xs text-slate-600">
              第 {currentPage} / {pageCount} 页
            </span>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOffset((current) => current + PAGE_LIMIT)}
              disabled={!hasNext || isLoading}
            >
              下一页
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-500">{errorMessage}</p>
        ) : null}

        {isLoading ? (
          <p className="text-sm text-slate-500">正在加载载荷...</p>
        ) : null}

        {!isLoading && payloads.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600">
            这个 Webhook 暂时还没有收到任何载荷。
          </p>
        ) : null}

        <div className="space-y-3">
          {payloads.map((payload: BoardWebhookPayloadRead) => (
            <div
              key={payload.id}
              className="space-y-3 rounded-lg border border-slate-200 px-4 py-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-semibold text-slate-900">
                  载荷 {payload.id.slice(0, 8)}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(payload.received_at).toLocaleString()}
                </span>
              </div>
              <div className="grid gap-2 text-xs text-slate-600 md:grid-cols-2">
                <p>
                  内容类型: <code>{payload.content_type ?? "未提供"}</code>
                </p>
                <p>
                  来源 IP: <code>{payload.source_ip ?? "未提供"}</code>
                </p>
              </div>
              <pre className="max-h-96 overflow-auto rounded-md bg-slate-900/95 p-3 text-xs text-slate-100">
                {stringifyPayload(payload.payload)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </DashboardPageLayout>
  );
}
