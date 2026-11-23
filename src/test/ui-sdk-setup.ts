import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

declare global {
  var __UI_SDK_STRICT__: boolean | undefined;
}

export function setupUiSdkJsdom(): void {
  globalThis.__UI_SDK_STRICT__ = true;

  if (typeof HTMLElement !== 'undefined') {
    HTMLElement.prototype.showPopover = function () {};
    HTMLElement.prototype.hidePopover = function () {};
  }

  if (typeof Element !== 'undefined') {
    Element.prototype.getAnimations = () => [];
    Element.prototype.scrollIntoView = function () {};
    Element.prototype.checkVisibility = () => true;
    Element.prototype.getClientRects = () => [] as unknown as DOMRectList;
  }

  if (typeof document !== 'undefined') {
    document.elementFromPoint = () => null;
    document.elementsFromPoint = () => [];

    if (!document.head.querySelector('style[data-ui-sdk-jsdom]')) {
      const style = document.createElement('style');
      style.setAttribute('data-ui-sdk-jsdom', '');
      style.textContent = '[popover] { display: block !important }';
      document.head.append(style);
    }
  }

  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  afterEach(cleanup);
}
