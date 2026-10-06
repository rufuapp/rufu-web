'use client';

import { useSyncExternalStore } from 'react';
import { STORAGE_KEY, emptyProgress, parseProgress, saveProgress, type Progress } from './progress';

const SERVER_SNAPSHOT = emptyProgress();
const listeners = new Set<() => void>();
let memory: Progress = emptyProgress();
let cache: { raw: string | null; value: Progress } | null = null;

function read(): Progress {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memory;
  }
  if (cache && cache.raw === raw) return cache.value;
  cache = { raw, value: parseProgress(raw) };
  return cache.value;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener('storage', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}

export function updateProgress(fn: (p: Progress) => Progress) {
  memory = fn(read());
  saveProgress(memory);
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, read, () => SERVER_SNAPSHOT);
}

const noopSubscribe = () => () => {};

/** サーバーでは false、クライアントでは true（ハイドレーション後にだけ描画したいもの用） */
export function useIsClient(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
