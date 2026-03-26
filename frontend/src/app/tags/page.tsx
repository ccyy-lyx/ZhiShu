"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/clerk";
import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/mutator";
import {
  getListTagsApiV1TagsGetQueryKey,
  type listTagsApiV1TagsGetResponse,
  useDeleteTagApiV1TagsTagIdDelete,
  useListTagsApiV1TagsGet,
} from "@/api/generated/tags/tags";
import type { TagRead } from "@/api/generated/model";
import { TagsTable } from "@/components/tags/TagsTable";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import { useUrlSorting } from "@/lib/use-url-sorting";

const TAG_SORTABLE_COLUMNS = ["name", "task_count", "updated_at"];

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) return error.message || fallback;
  if (error instanceof Error) return error.message || fallback;
  return fallback;
};

export default function TagsPage() {
  const { isSignedIn } = useAuth();
  const { isAdmin } = useOrganizationMembership(isSignedIn);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sorting, onSortingChange } = useUrlSorting({
    allowedColumnIds: TAG_SORTABLE_COLUMNS,
    defaultSorting: [{ id: "name", desc: false }],
    paramPrefix: "tags",
  });

  const [deleteTarget, setDeleteTarget] = useState<TagRead | null>(null);

  const tagsQuery = useListTagsApiV1TagsGet<
    listTagsApiV1TagsGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn),
      refetchOnMount: "always",
      refetchInterval: 30_000,
    },
  });
  const tags = useMemo(
    () =>
      tagsQuery.data?.status === 200 ? (tagsQuery.data.data.items ?? []) : [],
    [tagsQuery.data],
  );
  const tagsKey = getListTagsApiV1TagsGetQueryKey();

  const deleteMutation = useDeleteTagApiV1TagsTagIdDelete({
    mutation: {
      onSuccess: async () => {
        setDeleteTarget(null);
        await queryClient.invalidateQueries({ queryKey: tagsKey });
      },
    },
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ tagId: deleteTarget.id });
  };

  return (
    <>
      <DashboardPageLayout
        signedOut={{
          message: "登录后可管理标签。",
          forceRedirectUrl: "/tags",
          signUpForceRedirectUrl: "/tags",
        }}
        title="标签"
        description={`已配置 ${tags.length} 个标签。`}
        headerActions={
          isAdmin ? (
            <Link
              href="/tags/add"
              className={buttonVariants({ size: "md", variant: "primary" })}
            >
              新建标签
            </Link>
          ) : null
        }
        isAdmin={isAdmin}
        adminOnlyMessage="仅组织所有者和管理员可管理标签。"
        stickyHeader
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <TagsTable
            tags={tags}
            isLoading={tagsQuery.isLoading}
            sorting={sorting}
            onSortingChange={onSortingChange}
            stickyHeader
            onEdit={
              isAdmin
                ? (tag) => {
                    router.push(`/tags/${tag.id}/edit`);
                  }
                : undefined
            }
            onDelete={isAdmin ? setDeleteTarget : undefined}
            emptyState={{
              title: "暂无标签",
              description:
                "创建标签后，可在多个看板中对任务进行统一分类。",
              actionHref: isAdmin ? "/tags/add" : undefined,
              actionLabel: isAdmin ? "创建第一个标签" : undefined,
            }}
          />
        </div>
        {tagsQuery.error ? (
          <p className="mt-4 text-sm text-rose-600">
            {tagsQuery.error.message}
          </p>
        ) : null}
      </DashboardPageLayout>

      <ConfirmActionDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        ariaLabel="删除标签"
        title="删除标签"
        description={
          <>
            删除后，<strong>{deleteTarget?.name}</strong> 会从所有已标记任务中移除。
            此操作无法撤销。
          </>
        }
        errorMessage={
          deleteMutation.error
            ? extractErrorMessage(deleteMutation.error, "无法删除标签。")
            : undefined
        }
        onConfirm={handleDelete}
        isConfirming={deleteMutation.isPending}
      />
    </>
  );
}
