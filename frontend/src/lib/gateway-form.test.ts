import { beforeEach, describe, expect, it, vi } from "vitest";

import { gatewaysStatusApiV1GatewaysStatusGet } from "@/api/generated/gateways/gateways";

import { checkGatewayConnection, validateGatewayUrl } from "./gateway-form";

vi.mock("@/api/generated/gateways/gateways", () => ({
  gatewaysStatusApiV1GatewaysStatusGet: vi.fn(),
}));

const mockedGatewaysStatusApiV1GatewaysStatusGet = vi.mocked(
  gatewaysStatusApiV1GatewaysStatusGet,
);

describe("validateGatewayUrl", () => {
  it("accepts ws:// with explicit non-default port", () => {
    expect(validateGatewayUrl("ws://localhost:18789")).toBeNull();
  });

  it("accepts wss:// with explicit non-default port", () => {
    expect(validateGatewayUrl("wss://gateway.example.com:8443")).toBeNull();
  });

  it("accepts wss:// with explicit default port 443", () => {
    expect(validateGatewayUrl("wss://devbot.tailcc2080.ts.net:443")).toBeNull();
  });

  it("accepts ws:// with explicit default port 80", () => {
    expect(validateGatewayUrl("ws://localhost:80")).toBeNull();
  });

  it("accepts URLs with a path after the port", () => {
    expect(validateGatewayUrl("wss://host.example.com:443/gateway")).toBeNull();
  });

  it("trims surrounding whitespace before validating", () => {
    expect(validateGatewayUrl("  wss://host:443  ")).toBeNull();
  });

  it("accepts IPv6 URLs with explicit non-default port", () => {
    expect(validateGatewayUrl("wss://[::1]:8080")).toBeNull();
  });

  it("accepts IPv6 URLs with explicit default port", () => {
    expect(validateGatewayUrl("wss://[2001:db8::1]:443")).toBeNull();
  });

  it("accepts userinfo URLs with explicit port", () => {
    expect(
      validateGatewayUrl("ws://user:pass@gateway.example.com:8080"),
    ).toBeNull();
  });

  it("accepts userinfo URLs with IPv6 host and explicit port", () => {
    expect(validateGatewayUrl("wss://user@[::1]:443")).toBeNull();
  });

  it("rejects empty string", () => {
    expect(validateGatewayUrl("")).toBe("请填写网关 URL。");
  });

  it("rejects wss:// with no port at all", () => {
    expect(validateGatewayUrl("wss://gateway.example.com")).toBe(
      "网关 URL 必须包含明确端口。",
    );
  });

  it("rejects ws:// with no port at all", () => {
    expect(validateGatewayUrl("ws://localhost")).toBe(
      "网关 URL 必须包含明确端口。",
    );
  });

  it("rejects https:// scheme", () => {
    expect(validateGatewayUrl("https://gateway.example.com:443")).toBe(
      "网关 URL 必须以 ws:// 或 wss:// 开头。",
    );
  });

  it("rejects http:// scheme", () => {
    expect(validateGatewayUrl("http://localhost:8080")).toBe(
      "网关 URL 必须以 ws:// 或 wss:// 开头。",
    );
  });

  it("rejects completely invalid URL", () => {
    expect(validateGatewayUrl("not-a-url")).toBe(
      "请输入包含端口的有效网关 URL。",
    );
  });

  it("rejects out-of-range ports", () => {
    expect(validateGatewayUrl("wss://gateway.example.com:65536")).toBe(
      "请输入包含端口的有效网关 URL。",
    );
  });

  it("rejects userinfo URLs with no explicit port", () => {
    expect(validateGatewayUrl("ws://user:pass@gateway.example.com")).toBe(
      "网关 URL 必须包含明确端口。",
    );
  });

  it("rejects URL with only whitespace", () => {
    expect(validateGatewayUrl("   ")).toBe("请填写网关 URL。");
  });
});

describe("checkGatewayConnection", () => {
  beforeEach(() => {
    mockedGatewaysStatusApiV1GatewaysStatusGet.mockReset();
  });

  it("passes pairing and TLS toggles to gateway status API", async () => {
    mockedGatewaysStatusApiV1GatewaysStatusGet.mockResolvedValue({
      status: 200,
      data: { connected: true },
    } as never);

    const result = await checkGatewayConnection({
      gatewayUrl: "ws://gateway.example:18789",
      gatewayToken: "secret-token",
      gatewayDisableDevicePairing: true,
      gatewayAllowInsecureTls: true,
    });

    expect(mockedGatewaysStatusApiV1GatewaysStatusGet).toHaveBeenCalledWith({
      gateway_url: "ws://gateway.example:18789",
      gateway_token: "secret-token",
      gateway_disable_device_pairing: true,
      gateway_allow_insecure_tls: true,
    });
    expect(result).toEqual({ ok: true, message: "网关连接正常。" });
  });

  it("returns gateway-provided error message when offline", async () => {
    mockedGatewaysStatusApiV1GatewaysStatusGet.mockResolvedValue({
      status: 200,
      data: {
        connected: false,
        error: "missing required scope",
      },
    } as never);

    const result = await checkGatewayConnection({
      gatewayUrl: "ws://gateway.example:18789",
      gatewayToken: "",
      gatewayDisableDevicePairing: false,
      gatewayAllowInsecureTls: false,
    });

    expect(result).toEqual({ ok: false, message: "missing required scope" });
  });
});
