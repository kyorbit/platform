import type { RenderBracketPngOptions } from '@/components/tournament-bracket/export-bracket-png';
import { renderBracketToPng } from '@/components/tournament-bracket/export-bracket-png';

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'bracket'
  );
}

export function bracketScreenshotFilename(
  tournamentName: string,
  divisionName: string
): string {
  return `${slugify(tournamentName)}-${slugify(divisionName)}-bracket.png`;
}

export async function captureBracketPng(
  options: RenderBracketPngOptions
): Promise<Blob> {
  const { blob } = await renderBracketToPng(options);
  return blob;
}
