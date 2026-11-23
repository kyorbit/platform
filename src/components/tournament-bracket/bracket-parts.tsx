'use client';

import { createParts } from '@ui-sdk/react/primitive';
import { bracketPrimitive } from './bracket-primitive';

const {
  Root: BracketRoot,
  Surface: BracketSurface,
  Slot: BracketSlotPart,
  LockButton: BracketLockButtonPart,
} = createParts(bracketPrimitive, {
  root: 'div',
  surface: 'div',
  slot: 'button',
  lockButton: 'button',
});

export { BracketLockButtonPart, BracketRoot, BracketSlotPart, BracketSurface };
