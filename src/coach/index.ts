/** The post-class coach — the only import surface for views. */
export { buildSystemPrompt, OPENING_LINE, PROPOSAL_FORMAT } from './prompt';
export type { CoachContext } from './prompt';
export {
  COACH_PROGRAM_ID,
  extractJson,
  validateProposal,
  readProposal,
  loadCoachProgram,
  saveCoachProgram,
} from './proposal';
export type { Proposal, ProposalResult } from './proposal';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** One turn with the coach through the local proxy (server/coach.mjs). */
export async function askCoach(messages: ChatMessage[], date?: string): Promise<string> {
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages, date }),
  });
  if (!res.ok) {
    let detail = '';
    try {
      detail = ((await res.json()) as { error?: string }).error ?? '';
    } catch {
      /* no body */
    }
    throw new Error(detail || `coach unavailable (${res.status})`);
  }
  const data = (await res.json()) as { content?: string };
  return data.content ?? '';
}
