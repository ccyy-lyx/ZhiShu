"use client";

import type { MarketplaceSkillCardRead } from "@/api/generated/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type GatewaySummary = {
  id: string;
  name: string;
};

type SkillInstallDialogProps = {
  selectedSkill: MarketplaceSkillCardRead | null;
  gateways: GatewaySummary[];
  gatewayInstalledById: Record<string, boolean>;
  isGatewayStatusLoading: boolean;
  installingGatewayId: string | null;
  isMutating: boolean;
  gatewayStatusError: string | null;
  mutationError: string | null;
  onOpenChange: (open: boolean) => void;
  onToggleInstall: (gatewayId: string, isInstalled: boolean) => void;
};

export function SkillInstallDialog({
  selectedSkill,
  gateways,
  gatewayInstalledById,
  isGatewayStatusLoading,
  installingGatewayId,
  isMutating,
  gatewayStatusError,
  mutationError,
  onOpenChange,
  onToggleInstall,
}: SkillInstallDialogProps) {
  return (
    <Dialog open={Boolean(selectedSkill)} onOpenChange={onOpenChange}>
      <DialogContent
        aria-label="在网关上安装技能"
        className="max-w-xl p-6 sm:p-7"
      >
        <DialogHeader className="pb-1">
          <DialogTitle>
            {selectedSkill ? selectedSkill.name : "安装技能"}
          </DialogTitle>
          <DialogDescription>
            选择一个或多个网关来安装此技能。
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-3.5">
          {isGatewayStatusLoading ? (
            <p className="text-sm text-slate-500">加载网关中...</p>
          ) : (
            gateways.map((gateway) => {
              const isInstalled = gatewayInstalledById[gateway.id] === true;
              const isUpdatingGateway =
                installingGatewayId === gateway.id && isMutating;
              return (
                <div
                  key={gateway.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {gateway.name}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant={isInstalled ? "outline" : "primary"}
                    onClick={() => onToggleInstall(gateway.id, isInstalled)}
                    disabled={isMutating}
                  >
                    {isInstalled
                      ? isUpdatingGateway
                        ? "卸载中..."
                        : "卸载"
                      : isUpdatingGateway
                        ? "安装中..."
                        : "安装"}
                  </Button>
                </div>
              );
            })
          )}
          {gatewayStatusError ? (
            <p className="text-sm text-rose-600">{gatewayStatusError}</p>
          ) : null}
          {mutationError ? (
            <p className="text-sm text-rose-600">{mutationError}</p>
          ) : null}
        </div>

        <DialogFooter className="mt-6 border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isMutating}
          >
            关闭
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
