'use client';

import { Button } from '@ui-sdk/react/button';
import {
  Camera,
  Maximize2,
  Minimize2,
  Scan,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useBracketChrome } from '@/features/dashboard/contexts/bracket-chrome';
import { Card } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type BracketViewToolbarProps = {
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom?: () => void;
  zoomPercent?: number;
};

const ICON_BTN_CLASS =
  'hover:bg-accent hover:text-accent-foreground inline-flex size-8 cursor-pointer items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50';

export function BracketViewToolbar({
  onFit,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  zoomPercent,
}: BracketViewToolbarProps) {
  const { isFullscreen, toggleFullscreen, setScreenshotOpen, captureTarget } =
    useBracketChrome();

  const canScreenshot = captureTarget != null;

  return (
    <Card
      className="bg-popover absolute top-2.5 right-2.5 z-10 flex flex-col gap-0.5 rounded-md border p-1 shadow-md ring-0"
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              aria-label="Capture bracket screenshot"
              className={ICON_BTN_CLASS}
              disabled={!canScreenshot}
              onClick={() => setScreenshotOpen(true)}
            >
              <Camera className="size-4" aria-hidden="true" />
              <span className="sr-only">Capture bracket screenshot</span>
            </Button>
          }
        />
        <TooltipContent side="left">Screenshot</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              aria-label="Zoom in"
              className={ICON_BTN_CLASS}
              onClick={onZoomIn}
            >
              <ZoomIn className="size-4" aria-hidden="true" />
              <span className="sr-only">Zoom in</span>
            </Button>
          }
        />
        <TooltipContent side="left">Zoom in</TooltipContent>
      </Tooltip>
      {zoomPercent !== undefined && onResetZoom && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                aria-label={`Reset zoom to 100%, currently ${zoomPercent}%`}
                className="hover:bg-accent hover:text-accent-foreground text-muted-foreground inline-flex h-6 w-8 cursor-pointer items-center justify-center rounded-md font-mono text-[10px] font-medium tabular-nums transition-colors"
                onClick={onResetZoom}
              >
                {zoomPercent}%
              </Button>
            }
          />
          <TooltipContent side="left">Reset zoom (100%)</TooltipContent>
        </Tooltip>
      )}
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              aria-label="Zoom out"
              className={ICON_BTN_CLASS}
              onClick={onZoomOut}
            >
              <ZoomOut className="size-4" aria-hidden="true" />
              <span className="sr-only">Zoom out</span>
            </Button>
          }
        />
        <TooltipContent side="left">Zoom out</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              aria-label="Fit bracket to view"
              className={ICON_BTN_CLASS}
              onClick={onFit}
            >
              <Scan className="size-4" aria-hidden="true" />
              <span className="sr-only">Fit bracket to view</span>
            </Button>
          }
        />
        <TooltipContent side="left">Fit to view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              aria-label={
                isFullscreen
                  ? 'Exit bracket fullscreen'
                  : 'Toggle bracket fullscreen'
              }
              className={ICON_BTN_CLASS}
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="size-4" aria-hidden="true" />
              ) : (
                <Maximize2 className="size-4" aria-hidden="true" />
              )}
              <span className="sr-only">
                {isFullscreen
                  ? 'Exit bracket fullscreen'
                  : 'Toggle bracket fullscreen'}
              </span>
            </Button>
          }
        />
        <TooltipContent side="left">
          {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        </TooltipContent>
      </Tooltip>
    </Card>
  );
}
