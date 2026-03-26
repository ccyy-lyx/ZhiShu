"use client";

import { AuthMode } from "@/auth/mode";
import { useSyncExternalStore } from "react";

let localToken: string | null = null;
const STORAGE_KEY = "mc_local_auth_token";
const CHANGE_EVENT = "mc-local-auth-token";

export function isLocalAuthMode(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_MODE === AuthMode.Local;
}

function readTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function notifyTokenChange(): void {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // ignore
  }
}

export function setLocalAuthToken(token: string): void {
  localToken = token;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  } catch {
    // Ignore storage failures (private mode / policy).
  }
  notifyTokenChange();
}

export function getLocalAuthToken(): string | null {
  if (localToken) return localToken;
  const stored = readTokenFromStorage();
  if (stored) {
    localToken = stored;
    return stored;
  }
  return null;
}

export function clearLocalAuthToken(): void {
  localToken = null;
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures (private mode / policy).
  }
  notifyTokenChange();
}

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = () => onStoreChange();
  window.addEventListener(CHANGE_EVENT, handler);
  window.addEventListener("storage", handler);

  // Trigger one re-check after mount so hydration uses the server snapshot,
  // then we immediately reconcile with the real client storage value.
  queueMicrotask(handler);

  return () => {
    window.removeEventListener(CHANGE_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useLocalAuthToken(): string | null {
  return useSyncExternalStore(subscribe, readTokenFromStorage, () => null);
}
