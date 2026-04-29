export type InlineImageSegment =
  | { type: 'text'; text: string }
  | { type: 'image'; url: string };

const inlineImagePattern = /!\[image\]\(([^)]+)\)/g;

export function inlineImageToken(url: string): string {
  return `![image](${url})`;
}

export function splitInlineImages(value: string): InlineImageSegment[] {
  const segments: InlineImageSegment[] = [];
  let lastIndex = 0;

  for (const match of value.matchAll(inlineImagePattern)) {
    if (match.index === undefined) continue;
    segments.push({ type: 'text', text: value.slice(lastIndex, match.index) });
    segments.push({ type: 'image', url: match[1] });
    lastIndex = match.index + match[0].length;
  }

  segments.push({ type: 'text', text: value.slice(lastIndex) });
  return segments.length > 1 ? segments : [{ type: 'text', text: value }];
}

export function extractInlineImageUrls(...values: string[]): string[] {
  const urls = new Set<string>();
  for (const value of values) {
    for (const match of value.matchAll(inlineImagePattern)) {
      urls.add(match[1]);
    }
  }
  return [...urls];
}

export function stripInlineImages(value: string): string {
  return value
    .replace(inlineImagePattern, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function appendInlineImage(value: string, url: string): string {
  const trimmedEnd = value.replace(/\s+$/, '');
  const prefix = trimmedEnd ? `${trimmedEnd}\n\n` : '';
  return `${prefix}${inlineImageToken(url)}\n\n`;
}

export function removeInlineImage(value: string, url: string): string {
  return value
    .split(inlineImageToken(url))
    .join('')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
