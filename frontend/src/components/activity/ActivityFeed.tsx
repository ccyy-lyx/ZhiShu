import type { ReactNode } from "react";

type FeedItem = {
  id: string;
};

type ActivityFeedProps<TItem extends FeedItem> = {
  isLoading: boolean;
  errorMessage?: string | null;
  items: TItem[];
  renderItem: (item: TItem) => ReactNode;
};

export function ActivityFeed<TItem extends FeedItem>({
  isLoading,
  errorMessage,
  items,
  renderItem,
}: ActivityFeedProps<TItem>) {
  if (isLoading && items.length === 0) {
    return <p className="text-sm text-slate-500">正在加载动态…</p>;
  }

  const hasError = errorMessage !== null && errorMessage !== undefined;
  if (hasError) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        {errorMessage || "无法加载动态。"}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-900">
          暂无新动态…
        </p>
        <p className="mt-1 text-sm text-slate-500">
          有更新时会显示在这里。
        </p>
      </div>
    );
  }

  return <div className="space-y-4">{items.map(renderItem)}</div>;
}
