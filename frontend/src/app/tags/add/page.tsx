"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";

import { useAuth } from "@/auth/clerk";

import { ApiError } from "@/api/mutator";
import { useCreateTagApiV1TagsPost } from "@/api/generated/tags/tags";
import { TagForm } from "@/components/tags/TagForm";
import { DashboardPageLayout } from "@/components/templates/DashboardPageLayout";
import { useOrganizationMembership } from "@/lib/use-organization-membership";

export default function NewTagPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isAdmin } = useOrganizationMembership(isSignedIn);

  const createMutation = useCreateTagApiV1TagsPost<ApiError>({
    mutation: {
      retry: false,
    },
  });

  return (
    <DashboardPageLayout
      signedOut={{
        message: "登录后可创建标签。",
        forceRedirectUrl: "/tags/add",
        signUpForceRedirectUrl: "/tags/add",
      }}
      title="创建标签"
      description="定义一个可复用的标签用于任务分组。"
      isAdmin={isAdmin}
      adminOnlyMessage="仅组织所有者和管理员可以管理标签。"
    >
      <TagForm
        isSubmitting={createMutation.isPending}
        submitLabel="创建标签"
        submittingLabel="创建中…"
        onCancel={() => router.push("/tags")}
        onSubmit={async (values) => {
          const result = await createMutation.mutateAsync({
            data: values,
          });
          if (result.status !== 200) {
            throw new Error("无法创建标签。" );
          }
          router.push("/tags");
        }}
      />
    </DashboardPageLayout>
  );
}
