"use client";

export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/auth/clerk";
import { useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/mutator";
import {
  type listBoardsApiV1BoardsGetResponse,
  getListBoardsApiV1BoardsGetQueryKey,
  useDeleteBoardApiV1BoardsBoardIdDelete,
  useListBoardsApiV1BoardsGet,
} from "@/api/generated/boards/boards";
import {
  type listBoardGroupsApiV1BoardGroupsGetResponse,
  useListBoardGroupsApiV1BoardGroupsGet,
} from "@/api/generated/board-groups/board-groups";
import { createOptimisticListDeleteMutation } from "@/lib/list-delete";
import { useOrganizationMembership } from "@/lib/use-organization-membership";
import { useUrlSorting } from "@/lib/use-url-sorting";
import type { BoardRead } from "@/api/generated/model";
import { BoardsTable } from "@/components/boards/BoardsTable";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { buttonVariants } from "@/components/ui/button";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

const BOARD_SORTABLE_COLUMNS = ["name", "group", "updated_at"];

export default function BoardsPage() {
  const { isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { sorting, onSortingChange } = useUrlSorting({
    allowedColumnIds: BOARD_SORTABLE_COLUMNS,
    defaultSorting: [{ id: "name", desc: false }],
    paramPrefix: "boards",
  });

  const { isAdmin } = useOrganizationMembership(isSignedIn);
  const [deleteTarget, setDeleteTarget] = useState<BoardRead | null>(null);

  const boardsKey = getListBoardsApiV1BoardsGetQueryKey();
  const boardsQuery = useListBoardsApiV1BoardsGet<
    listBoardsApiV1BoardsGetResponse,
    ApiError
  >(undefined, {
    query: {
      enabled: Boolean(isSignedIn),
      refetchInterval: 30_000,
      refetchOnMount: "always",
    },
  });

  const groupsQuery = useListBoardGroupsApiV1BoardGroupsGet<
    listBoardGroupsApiV1BoardGroupsGetResponse,
    ApiError
  >(
    { limit: 200 },
    {
      query: {
        enabled: Boolean(isSignedIn),
        refetchInterval: 30_000,
        refetchOnMount: "always",
      },
    },
  );

  const boards = useMemo(
    () =>
      boardsQuery.data?.status === 200
        ? (boardsQuery.data.data.items ?? [])
        : [],
    [boardsQuery.data],
  );

  const groups = useMemo(() => {
    if (groupsQuery.data?.status !== 200) return [];
    return groupsQuery.data.data.items ?? [];
  }, [groupsQuery.data]);

  const deleteMutation = useDeleteBoardApiV1BoardsBoardIdDelete<
    ApiError,
    { previous?: listBoardsApiV1BoardsGetResponse }
  >(
    {
      mutation: createOptimisticListDeleteMutation<
        BoardRead,
        listBoardsApiV1BoardsGetResponse,
        { boardId: string }
      >({
        queryClient,
        queryKey: boardsKey,
        getItemId: (board) => board.id,
        getDeleteId: ({ boardId }) => boardId,
        onSuccess: () => {
          setDeleteTarget(null);
        },
        invalidateQueryKeys: [boardsKey],
      }),
    },
    queryClient,
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate({ boardId: deleteTarget.id });
  };

  return (
    <>
      <DashboardPageLayout
        signedOut={{
          message: "请先登录后查看看板。",
          forceRedirectUrl: "/boards",
          signUpForceRedirectUrl: "/boards",
        }}
        title="看板"
        description={`管理看板与任务流。共 ${boards.length} 个看板。`}
        headerActions={
          boards.length > 0 && isAdmin ? (
            <Link
              href="/boards/new"
              className={buttonVariants({
                size: "md",
                variant: "primary",
              })}
            >
              创建看板
            </Link>
          ) : null
        }
        stickyHeader
      >
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <BoardsTable
            boards={boards}
            boardGroups={groups}
            isLoading={boardsQuery.isLoading}
            sorting={sorting}
            onSortingChange={onSortingChange}
            showActions
            stickyHeader
            onDelete={setDeleteTarget}
            emptyState={{
              title: "还没有看板",
              description:
                "创建第一个看板，即可开始分发任务并追踪智能体协作进度。",
              actionHref: "/boards/new",
              actionLabel: "创建第一个看板",
            }}
          />
        </div>

        {boardsQuery.error ? (
          <p className="mt-4 text-sm text-red-500">
            {boardsQuery.error.message}
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
        ariaLabel="删除看板"
        title="删除看板"
        description={
          <>
            这将删除 {deleteTarget?.name}。此操作不可撤销。
          </>
        }
        errorMessage={deleteMutation.error?.message}
        onConfirm={handleDelete}
        isConfirming={deleteMutation.isPending}
      />
    </>
  );
}
