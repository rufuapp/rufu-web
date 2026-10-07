import type { CSSProperties } from 'react';

/** .tint クラスと組み合わせて、色を淡く敷いたバッジなどを作る */
export function tint(color: string): CSSProperties {
  return { '--tint': color } as CSSProperties;
}

/** 正答率に応じた色（70%以上=緑、50%以上=黄、それ未満=赤） */
export function rateColor(rate: number): string {
  if (rate >= 0.7) return 'var(--d-ok)';
  if (rate >= 0.5) return 'var(--d-warn)';
  return 'var(--d-ng)';
}

export const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
