"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/auth/clerk";
import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/mutator";
import {
  type listBoardGroupsApiV1BoardGroupsGetResponse,
  getListBoardGroupsApiV1BoardGroupsGetQueryKey,
  useDeleteBoardGroupApiV1BoardGroupsGroupIdDelete,
  useListBoardGroupsApiV1BoardGroupsGet,
} from "@/api/generated/board-groups/board-groups";
import { BoardGroupsTable } from "@/components/board-groups/BoardGroupsTable";
import type { BoardGroupRead } from "@/api/generated/model";
import { createOptimisticListDeleteMutation } from "@/lib/list-delete";
import { useUrlSorting } from "@/lib/use-url-sorting";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

const BOARD_GROUP_SORTABLE_COLUMNS = ["name", "updated_at"];

export default function BoardGroupsPage() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { sorting, onSortingChange } = useUrlSorting({
    allowedColumnIds: BOARD_GROUP_SORTABLE_COLUMNS,
    defaultSorting: [{ id: "name", desc: false }],
    paramPrefix: "board_groups",
  });
  const [deleteTarget, setDeleteTarget] = useState<BoardGroupRead | null>(null);

  const groupsKey = getListBoardGroupsApiV1BoardGroupsGetQueryKey();
  const groupsQuery = useListBoardGroupsApiV1BoardGroupsGet<
    listBoardGroupsApiV1BoardGroupsGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn),
      refetchInterval: 30_000,
      refetchOnMount: "always",
    },
  });

  const groups = useMemo(
    () =>
      groupsQuery.data?.status === 200
        ? (groupsQuery.data.data.items ?? [])
        : [],
    [groupsQuery.data],
  );

  const deleteMutation = useDeleteBoardGroupApiV1BoardGroupsGroupIdDelete<
    ApiError,
    { previous?: listBoardGroupsApiV1BoardGroupsGetResponse }
  >(
    {
      mutation: createOptimisticListDeleteMutation<
        BoardGroupRead,
        listBoardGroupsApiV1BoardGroupsGetResponse,
        { groupId: string }
      >({
        queryClient,
        queryKey: groupsKey,
        getItemId: (group) => group.id,
        getDeleteId: ({ groupId }) => groupId,
        onSuccess: () => {
          setDeleteTarget(null);
        },
        invalidateQueryKeys: [groupsKey],
      }),
    },
    queryClient,
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ groupId: deleteTarget.id });
  };

  return (
    <>
      <DashboardPageLayout
        signedOut={{
          message: "登录后可查看看板分组。",
          forceRedirectUrl: "/board-groups",
        }}
        title="看板分组"
        description={`用于归类看板，方便智能体查看关联工作。共 ${groups.length} 个分组。`}
        headerActions={
          <Link
            href="/board-groups/new"
            className={buttonVariants({ size: "md", variant: "primary" })}
          >
            新建分组
          </Link>
        }
        stickyHeader
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <BoardGroupsTable
            groups={groups}
            isLoading={groupsQuery.isLoading}
            sorting={sorting}
            onSortingChange={onSortingChange}
            showActions
            stickyHeader
            onDelete={setDeleteTarget}
            emptyState={{
              title: "暂无分组",
              description: "创建看板分组后，智能体可更好地协同跨看板工作。",
              actionHref: "/board-groups/new",
              actionLabel: "创建第一个分组",
            }}
          />
        </div>

        {groupsQuery.error ? (
          <p className="mt-4 text-sm text-red-500">
            {groupsQuery.error.message}
          </p>
        ) : null}
      </DashboardPageLayout>
      <ConfirmActionDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
        ariaLabel="删除看板分组"
        title="删除看板分组"
        description={
          <>
            这将移除 {deleteTarget?.name}。相关看板会变为未分组状态。此操作无法撤销。
          </>
        }
        errorMessage={deleteMutation.error?.message}
        onConfirm={handleDelete}
        isConfirming={deleteMutation.isPending}
      />
    </>
  );
}
