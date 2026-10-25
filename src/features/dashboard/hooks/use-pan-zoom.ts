import React from 'react';

const SCALE_MIN = 0.25;
const SCALE_MAX = 2.5;
const PAD = 32;
const UPSCALE_CAP = 1.25;

function fitScale(w: number, h: number, W: number, H: number): number {
  if (w <= 0 || h <= 0 || W <= 0 || H <= 0) return 1;
  const raw = Math.min((W - PAD) / w, (H - PAD) / h);
  const s = Math.min(raw, UPSCALE_CAP, SCALE_MAX);
  return Math.max(SCALE_MIN, s);
}

function centerForScale(
  w: number,
  h: number,
  W: number,
  H: number,
  scale: number
): { x: number; y: number } {
  return {
    x: W / 2 - (w * scale) / 2,
    y: H / 2 - (h * scale) / 2,
  };
}

type Transform = { x: number; y: number; scale: number };
type Point = { x: number; y: number };
type Gesture =
  | { kind: 'pan'; start: Point; origin: Transform }
  | { kind: 'pinch'; dist: number; mid: Point; origin: Transform };

function clampScale(scale: number): number {
  return Math.min(SCALE_MAX, Math.max(SCALE_MIN, scale));
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function zoomAtPoint(
  t: Transform,
  focalX: number,
  focalY: number,
  nextScale: number
): Transform {
  const k = nextScale / t.scale;
  return {
    x: focalX - (focalX - t.x) * k,
    y: focalY - (focalY - t.y) * k,
    scale: nextScale,
  };
}

/**
 * @param contentWidth - Bracket layout width (px)
 * @param contentHeight - Bracket layout height (px)
 */
export function usePanZoom(contentWidth: number, contentHeight: number) {
  const [transform, setTransform] = React.useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
  });
  const transformRef = React.useRef(transform);
  transformRef.current = transform;

  const contentDimsRef = React.useRef({
    w: contentWidth,
    h: contentHeight,
  });
  contentDimsRef.current = { w: contentWidth, h: contentHeight };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const pointersRef = React.useRef(new Map<number, Point>());
  const gestureRef = React.useRef<Gesture | null>(null);

  const applyFitTransform = React.useCallback(() => {
    const node = containerRef.current;
    const { w, h } = contentDimsRef.current;
    if (!node || w <= 0 || h <= 0) return;
    const rect = node.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (W <= 0 || H <= 0) return;
    const scale = fitScale(w, h, W, H);
    const { x, y } = centerForScale(w, h, W, H, scale);
    setTransform({ x, y, scale });
  }, []);

  const recenterTransform = React.useCallback(() => {
    const node = containerRef.current;
    const { w, h } = contentDimsRef.current;
    if (!node || w <= 0 || h <= 0) return;
    const rect = node.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    if (W <= 0 || H <= 0) return;
    setTransform((t) => ({
      ...t,
      ...centerForScale(w, h, W, H, t.scale),
    }));
  }, []);

  React.useLayoutEffect(() => {
    applyFitTransform();
  }, [contentWidth, contentHeight, applyFitTransform]);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(recenterTransform);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recenterTransform]);

  const reset = React.useCallback(() => {
    applyFitTransform();
  }, [applyFitTransform]);

  const zoomAtViewportCenter = React.useCallback(
    (scaleFn: (scale: number) => number) => {
      const node = containerRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      setTransform((t) => {
        const nextScale = clampScale(scaleFn(t.scale));
        if (nextScale === t.scale) return t;
        return zoomAtPoint(t, cx, cy, nextScale);
      });
    },
    []
  );

  const zoomIn = React.useCallback(() => {
    zoomAtViewportCenter((s) => s * 1.15);
  }, [zoomAtViewportCenter]);

  const zoomOut = React.useCallback(() => {
    zoomAtViewportCenter((s) => s / 1.15);
  }, [zoomAtViewportCenter]);

  const onWheel = React.useCallback((e: WheelEvent) => {
    const el = containerRef.current;
    if (!el) return;
    e.preventDefault();
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const delta = -e.deltaY * 0.001;
    setTransform((prev) => {
      const nextScale = clampScale(prev.scale * (1 + delta));
      if (nextScale === prev.scale) return prev;
      return zoomAtPoint(prev, mx, my, nextScale);
    });
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  // Re-baselines whenever the pointer set changes, so 2 -> 1 pointers continues as a pan without a jump.
  const startGesture = React.useCallback(() => {
    const [a, b] = [...pointersRef.current.values()];
    const origin = transformRef.current;
    if (!a) gestureRef.current = null;
    else if (!b) gestureRef.current = { kind: 'pan', start: a, origin };
    else
      gestureRef.current = {
        kind: 'pinch',
        dist: distance(a, b),
        mid: midpoint(a, b),
        origin,
      };
  }, []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-bracket-slot]')) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      startGesture();
    },
    [startGesture]
  );

  React.useEffect(() => {
    function onMove(e: PointerEvent) {
      const pointers = pointersRef.current;
      const g = gestureRef.current;
      if (!g || !pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const [a, b] = [...pointers.values()];
      let next: Transform;
      if (g.kind === 'pan') {
        next = {
          ...g.origin,
          x: g.origin.x + (a.x - g.start.x),
          y: g.origin.y + (a.y - g.start.y),
        };
      } else {
        const rect = containerRef.current?.getBoundingClientRect();
        const mid = midpoint(a, b);
        const scale = clampScale(
          (g.origin.scale * distance(a, b)) / Math.max(g.dist, 1)
        );
        const moved = {
          ...g.origin,
          x: g.origin.x + (mid.x - g.mid.x),
          y: g.origin.y + (mid.y - g.mid.y),
        };
        next = zoomAtPoint(
          moved,
          mid.x - (rect?.left ?? 0),
          mid.y - (rect?.top ?? 0),
          scale
        );
      }
      transformRef.current = next;
      setTransform(next);
    }
    function onUp(e: PointerEvent) {
      if (pointersRef.current.delete(e.pointerId)) startGesture();
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [startGesture]);

  const handlers = React.useMemo(() => ({ onPointerDown }), [onPointerDown]);

  return { containerRef, transform, handlers, reset, zoomIn, zoomOut };
}
