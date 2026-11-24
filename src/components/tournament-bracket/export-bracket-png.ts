import { drawBracketCanvas } from './canvas-renderer';
import { LIGHT_BRACKET_THEME } from './canvas-theme';
import type { Match } from '@/contracts/matches/dto';
import type { TournamentAthlete } from '@/contracts/tournament-athletes/dto';
import type { BracketCanvasLayout } from '@/lib/tournament/bracket/bracket-layout';
import { canvasBuilders } from '@/lib/tournament/bracket/bracket-layout';

export interface RenderBracketPngOptions {
  matches: Array<Match>;
  thirdPlaceMatch: boolean;
  layoutMode: BracketCanvasLayout;
  athleteMap: ReadonlyMap<string, TournamentAthlete>;
  matchLabel: ReadonlyMap<string, number | null>;
  pixelRatio?: number;
  padding?: number;
}

export interface RenderedBracketPng {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
}

export async function renderBracketToPng(
  options: RenderBracketPngOptions
): Promise<RenderedBracketPng> {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Proceed with fallback fonts if font loading fails.
    }
  }

  const pixelRatio = options.pixelRatio ?? 2;
  const padding = options.padding ?? 48;
  const bracketMatches = options.matches.filter((m) => m.kind !== 'custom');
  const builder = canvasBuilders[options.layoutMode];
  const layout = builder.layout(bracketMatches, options.thirdPlaceMatch);
  const connectors = builder.connectors(
    layout.positions,
    layout.layoutMaxRound
  );

  const width = Math.max(1, Math.ceil(layout.width + padding * 2));
  const height = Math.max(1, Math.ceil(layout.height + padding * 2));

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context is unavailable for bracket PNG export.');
  }

  drawBracketCanvas(ctx, {
    layout,
    connectors,
    layoutMode: options.layoutMode,
    matches: bracketMatches,
    athleteMap: options.athleteMap,
    matchLabel: options.matchLabel,
    viewport: { x: padding, y: padding, zoom: 1 },
    dpr: pixelRatio,
    width,
    height,
    readOnly: true,
    selectedMatchId: null,
    focusedSlotKey: null,
    hoveredHit: null,
    dropTarget: null,
    theme: LIGHT_BRACKET_THEME,
    fillBackground: true,
  });

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to encode bracket PNG blob.'));
    }, 'image/png');
  });

  return { dataUrl, blob, width, height };
}
