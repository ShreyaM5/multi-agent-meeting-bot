const SPEAKER_LINE_RE = /^\s*([^:-][^:-]*?)\s*[:-]\s*(.+)$/;
const FILLER_RE = /(?:^|\s)(uh+|um+|ah+|like|you know|I mean|so|actually|basically|right)(?:[.,;:]?)(?=\s|$)/gi;
const BRACKETED_RE = /\[(?:inaudible|laughter|crosstalk|silence|noise)\]/gi;

function cleanSentence(text) {
  return text
    .replace(BRACKETED_RE, '')
    .replace(/\([^)]*\)/g, '')
    .replace(FILLER_RE, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[,;:\s]+/, '')
    .replace(/\s+([?.!,;:])/g, '$1')
    .trim();
}

export function parseTranscript(rawTranscript) {
  const lines = rawTranscript.split(/\r?\n/);
  const utterances = [];
  let current = null;

  for (const line of lines) {
    const text = line.trim();
    if (!text) {
      continue;
    }

    const match = text.match(SPEAKER_LINE_RE);
    if (match) {
      const speaker = match[1].trim();
      const sentence = cleanSentence(match[2]);
      if (!sentence) {
        continue;
      }
      current = { speaker, text: sentence, original: text };
      utterances.push(current);
    } else if (current) {
      const sentence = cleanSentence(text);
      if (sentence) {
        current.text += ' ' + sentence;
      }
    }
  }

  return utterances;
}
