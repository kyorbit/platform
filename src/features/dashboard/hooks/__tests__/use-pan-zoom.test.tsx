// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { usePanZoom } from '@/features/dashboard/hooks/use-pan-zoom';

type Transform = { x: number; y: number; scale: number };

let latest: Transform;

function Canvas() {
  const { containerRef, transform, handlers } = usePanZoom(0, 0);
  latest = transform;
  return (
    <div ref={containerRef} data-testid="container" {...handlers}>
      <div data-bracket-slot data-testid="slot" />
    </div>
  );
}

function setup() {
  const { getByTestId } = render(<Canvas />);
  return { container: getByTestId('container'), slot: getByTestId('slot') };
}

function down(
  el: Element,
  pointerId: number,
  clientX: number,
  clientY: number
) {
  fireEvent.pointerDown(el, {
    pointerId,
    clientX,
    clientY,
    button: 0,
    pointerType: 'touch',
  });
}

function move(
  el: Element,
  pointerId: number,
  clientX: number,
  clientY: number
) {
  fireEvent.pointerMove(el, {
    pointerId,
    clientX,
    clientY,
    pointerType: 'touch',
  });
}

function up(el: Element, pointerId: number) {
  fireEvent.pointerUp(el, { pointerId, pointerType: 'touch' });
}

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

describe('usePanZoom', () => {
  it('pans by the drag delta with one pointer', () => {
    const { container } = setup();
    down(container, 1, 100, 100);
    move(container, 1, 130, 80);
    expect(latest).toEqual({ x: 30, y: -20, scale: 1 });
  });

  it('pinch spread scales up and keeps the point under the midpoint fixed', () => {
    const { container } = setup();
    down(container, 1, 100, 100);
    down(container, 2, 200, 100);
    move(container, 1, 50, 100);
    move(container, 2, 250, 100);

    expect(latest.scale).toBeCloseTo(2);
    expect((150 - latest.x) / latest.scale).toBeCloseTo(150);
    expect((100 - latest.y) / latest.scale).toBeCloseTo(100);
  });

  it('clamps pinch scale at the minimum and maximum', () => {
    const { container } = setup();
    down(container, 1, 100, 100);
    down(container, 2, 200, 100);
    move(container, 2, 110, 100);
    expect(latest.scale).toBe(0.25);
    move(container, 2, 1100, 100);
    expect(latest.scale).toBe(2.5);
  });

  it('hands off from two pointers to one without a jump', () => {
    const { container } = setup();
    down(container, 1, 100, 100);
    down(container, 2, 200, 100);
    move(container, 2, 300, 100);
    const pinched = { ...latest };

    up(container, 2);
    expect(latest).toEqual(pinched);

    move(container, 1, 120, 110);
    expect(latest).toEqual({
      x: pinched.x + 20,
      y: pinched.y + 10,
      scale: pinched.scale,
    });
  });

  it('leaves the transform unchanged for a gesture starting on a slot', () => {
    const { container, slot } = setup();
    down(slot, 1, 100, 100);
    move(container, 1, 160, 140);
    up(container, 1);
    expect(latest).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it('wheel zooms at the cursor', () => {
    const { container } = setup();
    act(() => {
      container.dispatchEvent(
        new WheelEvent('wheel', {
          clientX: 100,
          clientY: 50,
          deltaY: -100,
          bubbles: true,
          cancelable: true,
        })
      );
    });
    expect(latest.scale).toBeCloseTo(1.1);
    expect((100 - latest.x) / latest.scale).toBeCloseTo(100);
    expect((50 - latest.y) / latest.scale).toBeCloseTo(50);
  });
});
