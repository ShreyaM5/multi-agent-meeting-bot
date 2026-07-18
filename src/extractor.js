const COMMITMENT_RE = /\b(?:I(?:'ll| will| am going to| can|m going to)?|we(?:'ll| will| are going to| should| need to)?|let(?:'s| us)|can you|could you|please|we need to|can we|could we)\b/i;
const DEADLINE_RE = /\b(?:by\s+(?<deadline>\b(?:next|this)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|day|tomorrow|today|eod|end of day|tomorrow)\b)|before\s+(?<deadline3>\b(?:next|this)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|day|tomorrow|today|eod|end of day|tomorrow)\b)|within\s+(?<deadline4>\b(?:next|this)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|day|tomorrow|today|eod|end of day|tomorrow)\b)|on\s+(?<deadline2>\b(?:next|this)?\s*(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday|week|month|day|tomorrow|today)\b))\b/i;
const PRIORITY_RE = /\b(asap|urgent|important|today|eod|end of day|right away|this week|next week|by tomorrow)\b/i;

const dateKeywords = {
  friday: 'Friday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  saturday: 'Saturday',
  sunday: 'Sunday',
  tomorrow: 'Tomorrow',
  today: 'Today',
  'end of day': 'End of day',
  eod: 'End of day',
  'next week': 'Next week',
  'this week': 'This week',
  asap: 'ASAP'
};

const IGNORED_SENTENCES = [
  /^okay,? let's kick off/i,
  /^let's get started/i,
  /^great,? let's/i,
  /^sounds good/i,
  /^thanks,? everyone/i,
  /^good idea/i
];

function extractDeadline(sentence) {
  const match = sentence.match(DEADLINE_RE);
  if (!match || !match.groups) {
    return null;
  }

  const raw = match.groups.deadline || match.groups.deadline2 || match.groups.deadline3 || match.groups.deadline4;
  if (!raw) {
    return null;
  }

  const cleaned = raw.trim().replace(/\.$/, '');
  const lower = cleaned.toLowerCase();
  for (const key of Object.keys(dateKeywords)) {
    if (lower.includes(key)) {
      return dateKeywords[key];
    }
  }
  return cleaned;
}

function extractPriority(sentence) {
  const match = sentence.match(PRIORITY_RE);
  if (!match) {
    return 'Medium';
  }
  const term = match[1].toLowerCase();
  if (/(asap|urgent|important|today|eod|end of day|right away|by tomorrow)/i.test(term)) {
    return 'High';
  }
  return 'Medium';
}

function splitSentences(text) {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function normalizeOwner(sentence, speaker) {
  if (/\bI\b|\bI'll\b|\bI will\b|\bI'm\b|\bI am\b/i.test(sentence)) {
    return speaker;
  }
  if (/\bwe\b|\blet(?:'s| us)\b|\bteam\b/i.test(sentence)) {
    return `${speaker}'s team`;
  }
  return speaker;
}

function isCommitment(sentence) {
  if (IGNORED_SENTENCES.some((pattern) => pattern.test(sentence))) {
    return false;
  }
  return COMMITMENT_RE.test(sentence);
}

export function extractCommitments(utterances) {
  const commitments = [];

  for (const utterance of utterances) {
    const sentences = splitSentences(utterance.text);
    for (const sentence of sentences) {
      if (!isCommitment(sentence)) {
        continue;
      }

      const owner = normalizeOwner(sentence, utterance.speaker);
      const dueDate = extractDeadline(sentence);
      const priority = extractPriority(sentence);
      const description = sentence.replace(/\s+/g, ' ').trim();
      const raw = sentence;

      commitments.push({ owner, description, dueDate, priority, raw, source: utterance.original });
    }
  }

  return commitments;
}
