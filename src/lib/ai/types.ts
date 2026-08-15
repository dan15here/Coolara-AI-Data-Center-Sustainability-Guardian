import type { Finding } from '@/types';

export interface ExplainFindingRequest {
  finding: Finding;
}

export interface ExplainFindingResponse {
  explanation: string;
  source: 'gemini' | 'fallback';
  model?: string;
}
