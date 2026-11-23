'use client';

import { agentTools, createAgent, registerTools } from '@ui-sdk/react/agent';
import type { AgentAction } from '@ui-sdk/react/agent';

export type AgentConfirmHandler = (
  step: AgentAction,
  context: { signal: AbortSignal }
) => boolean | Promise<boolean>;

let confirmHandler: AgentConfirmHandler | null = null;

const bracketAgent = createAgent({
  allow: (step, context) => {
    if (!step.confirm) return true;
    if (!confirmHandler) return false;
    return confirmHandler(step, context);
  },
});

export function setBracketAgentConfirmHandler(
  handler: AgentConfirmHandler | null
): void {
  confirmHandler = handler;
}

export function mountBracketAgentTools(
  onConfirm: AgentConfirmHandler
): () => void {
  setBracketAgentConfirmHandler(onConfirm);
  const unregister = registerTools(bracketAgent, { allow: () => true });
  return () => {
    unregister();
    if (confirmHandler === onConfirm) {
      confirmHandler = null;
    }
  };
}

export { agentTools, bracketAgent };
