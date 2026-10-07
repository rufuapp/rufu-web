/** 正答率に応じた色（70%以上=緑、50%以上=黄土、それ未満=朱） */
export function rateColor(rate: number): string {
  if (rate >= 0.7) return 'var(--d-ok)';
  if (rate >= 0.5) return 'var(--d-warn)';
  return 'var(--d-ng)';
}

/** 選択肢の記号（資格試験でおなじみのア・イ・ウ・エ） */
export const CHOICE_LABELS = ['ア', 'イ', 'ウ', 'エ', 'オ', 'カ', 'キ', 'ク'];
