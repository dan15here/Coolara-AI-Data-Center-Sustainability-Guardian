import { describe, expect, it } from 'vitest';
import type { ReactElement, ReactNode } from 'react';
import { renderAiMarkdown } from '../ai-markdown';

function lines(text: string): ReactElement[] {
  const fragment = renderAiMarkdown(text) as ReactElement;
  return (fragment.props as { children: ReactElement[] }).children;
}

function innerText(line: ReactElement): ReactNode {
  const inline = (line.props as { children: ReactNode[] }).children;
  return inline[0];
}

describe('renderAiMarkdown', () => {
  it('renders a real Gemini-style "* " bullet as a list item, not a stray-asterisk paragraph', () => {
    const [line] = lines('* This is a bullet from a live Gemini response.');
    expect(line.type).toBe('li');
  });

  it('still renders the documented "- " bullet as a list item', () => {
    const [line] = lines('- This is a bullet using the prompted format.');
    expect(line.type).toBe('li');
  });

  it('treats a non-bullet line as a paragraph', () => {
    const [line] = lines('**Bold summary line.**');
    expect(line.type).toBe('p');
  });

  it('does not leave a literal bullet marker in the rendered text', () => {
    const [line] = lines('* Elevated ambient temperature is a likely factor.');
    const text = innerText(line);
    expect(text).toBe('Elevated ambient temperature is a likely factor.');
  });
});
