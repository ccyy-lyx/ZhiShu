"use client";

import { useState } from "react";
import { Lock } from "lucide-react";

import { setLocalAuthToken } from "@/auth/localAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api-base";

const LOCAL_AUTH_TOKEN_MIN_LENGTH = 50;

async function validateLocalToken(token: string): Promise<string | null> {
  let baseUrl: string;
  try {
    baseUrl = getApiBaseUrl();
  } catch {
    return "无法解析后端地址。";
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/v1/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return "无法连接后端校验 token。";
  }

  if (response.ok) {
    return null;
  }
  if (response.status === 401 || response.status === 403) {
    return "token 无效。";
  }
  return `无法校验 token（HTTP ${response.status}）。`;
}

type LocalAuthLoginProps = {
  onAuthenticated?: () => void;
};

const defaultOnAuthenticated = () => window.location.reload();

export function LocalAuthLogin({ onAuthenticated }: LocalAuthLoginProps) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = token.trim();
    if (!cleaned) {
      setError("token 不能为空。");
      return;
    }
    if (cleaned.length < LOCAL_AUTH_TOKEN_MIN_LENGTH) {
      setError(
        `token 长度至少需要 ${LOCAL_AUTH_TOKEN_MIN_LENGTH} 位。`,
      );
      return;
    }

    setIsValidating(true);
    const validationError = await validateLocalToken(cleaned);
    setIsValidating(false);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLocalAuthToken(cleaned);
    setError(null);
    (onAuthenticated ?? defaultOnAuthenticated)();
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-app px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[color:var(--accent-soft)] blur-3xl" />
        <div className="absolute -right-28 -bottom-24 h-80 w-80 rounded-full bg-[rgba(14,165,233,0.12)] blur-3xl" />
      </div>

      <Card className="relative w-full max-w-lg animate-fade-in-up">
        <CardHeader className="space-y-5 border-b border-[color:var(--border)] pb-5">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
              自托管模式
            </span>
            <div className="rounded-xl bg-[color:var(--accent-soft)] p-2 text-[color:var(--accent)]">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-strong">
              本地认证
            </h1>
            <p className="text-sm text-muted">
              输入访问 token 进入 Mission Control。
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="local-auth-token"
                className="text-xs font-semibold uppercase tracking-[0.08em] text-muted"
              >
                访问 token
              </label>
              <Input
                id="local-auth-token"
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="粘贴 token"
                autoFocus
                disabled={isValidating}
                className="font-mono"
              />
            </div>
            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : (
              <p className="text-xs text-muted">
                token 长度至少需要 {LOCAL_AUTH_TOKEN_MIN_LENGTH} 位。
              </p>
            )}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isValidating}
            >
              {isValidating ? "校验中…" : "继续"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
