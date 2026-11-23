export interface BracketCanvasTheme {
  isDark: boolean;
  background: string;
  cardBg: string;
  cardBorder: string;
  cardBorderActive: string;
  cardBorderComplete: string;
  divider: string;
  textPrimary: string;
  textMuted: string;
  labelText: string;
  connectorPending: string;
  connectorActive: string;
  connectorComplete: string;
  redAccent: string;
  blueAccent: string;
  winnerTintRed: string;
  winnerTintBlue: string;
  hoverTint: string;
  selectedRing: string;
  focusRing: string;
  dropRing: string;
  dropFill: string;
  lockedColor: string;
  unlockedColor: string;
  fontSans: string;
  fontMono: string;
}

export const LIGHT_BRACKET_THEME: BracketCanvasTheme = {
  isDark: false,
  background: '#ffffff',
  cardBg: '#ffffff',
  cardBorder: '#e4e4e7',
  cardBorderActive: '#f59e0b',
  cardBorderComplete: '#3b82f6',
  divider: '#e4e4e7',
  textPrimary: '#09090b',
  textMuted: '#71717a',
  labelText: '#52525b',
  connectorPending: '#d4d4d8',
  connectorActive: '#f59e0b',
  connectorComplete: '#3b82f6',
  redAccent: '#ef4444',
  blueAccent: '#3b82f6',
  winnerTintRed: 'rgba(239, 68, 68, 0.12)',
  winnerTintBlue: 'rgba(59, 130, 246, 0.12)',
  hoverTint: 'rgba(24, 24, 27, 0.05)',
  selectedRing: '#2563eb',
  focusRing: '#2563eb',
  dropRing: '#0ea5e9',
  dropFill: 'rgba(14, 165, 233, 0.14)',
  lockedColor: '#d97706',
  unlockedColor: '#a1a1aa',
  fontSans: '"Geist Variable", Geist, system-ui, -apple-system, sans-serif',
  fontMono: '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace',
};

export const DARK_BRACKET_THEME: BracketCanvasTheme = {
  isDark: true,
  background: '#09090b',
  cardBg: '#18181b',
  cardBorder: '#27272a',
  cardBorderActive: '#f59e0b',
  cardBorderComplete: '#60a5fa',
  divider: '#27272a',
  textPrimary: '#fafafa',
  textMuted: '#a1a1aa',
  labelText: '#a1a1aa',
  connectorPending: '#3f3f46',
  connectorActive: '#f59e0b',
  connectorComplete: '#60a5fa',
  redAccent: '#ef4444',
  blueAccent: '#3b82f6',
  winnerTintRed: 'rgba(239, 68, 68, 0.2)',
  winnerTintBlue: 'rgba(59, 130, 246, 0.2)',
  hoverTint: 'rgba(255, 255, 255, 0.06)',
  selectedRing: '#60a5fa',
  focusRing: '#60a5fa',
  dropRing: '#38bdf8',
  dropFill: 'rgba(56, 189, 248, 0.18)',
  lockedColor: '#fbbf24',
  unlockedColor: '#71717a',
  fontSans: '"Geist Variable", Geist, system-ui, -apple-system, sans-serif',
  fontMono: '"Geist Mono Variable", "Geist Mono", ui-monospace, monospace',
};

function readCssColor(
  styles: CSSStyleDeclaration,
  varName: string,
  fallback: string
): string {
  const raw = styles.getPropertyValue(varName).trim();
  return raw || fallback;
}

export function resolveBracketTheme(
  el: HTMLElement | null
): BracketCanvasTheme {
  if (typeof document === 'undefined' || !el) {
    return LIGHT_BRACKET_THEME;
  }
  const isDark = document.documentElement.classList.contains('dark');
  const base = isDark ? DARK_BRACKET_THEME : LIGHT_BRACKET_THEME;
  const styles = getComputedStyle(el);

  return {
    ...base,
    cardBg: readCssColor(styles, '--card', base.cardBg),
    cardBorder: readCssColor(styles, '--border', base.cardBorder),
    divider: readCssColor(styles, '--border', base.divider),
    textPrimary: readCssColor(styles, '--card-foreground', base.textPrimary),
    textMuted: readCssColor(styles, '--muted-foreground', base.textMuted),
    labelText: readCssColor(styles, '--muted-foreground', base.labelText),
  };
}
