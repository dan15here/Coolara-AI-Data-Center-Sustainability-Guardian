import { NextResponse } from 'next/server';
import { explainFinding } from '@/lib/ai/gemini';
import { isValidFinding } from '@/lib/validation/finding';

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { finding } = (body ?? {}) as { finding?: unknown };

  if (!isValidFinding(finding)) {
    return NextResponse.json({ error: 'Request must include a valid finding' }, { status: 400 });
  }

  const result = await explainFinding({ finding });
  return NextResponse.json(result);
}
