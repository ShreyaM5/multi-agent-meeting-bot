function makeTaskTitle(description) {
  let title = description
    .replace(/^(?:yes|great|okay|so|please|and|sure)[,\s]+/i, '')
    .replace(/^and\s+/i, '')
    .replace(/^also\s+/i, '')
    .replace(/\b(?:I(?:'ll| will| am going to| can|m going to| think| believe)?|we(?:'ll| will| are going to| should| need to)|let(?:'s| us)|please|can you|could you)\b/gi, '')
    .replace(/\bby\b.*$/i, '')
    .replace(/\bwith\b.*$/i, '')
    .replace(/\b(on|before|within)\b.*$/i, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (!title) {
    title = description;
  }

  title = title.replace(/^[^.?!]*[.?!]$/, (match) => match.slice(0, -1));
  title = title.replace(/^[a-z]/, (match) => match.toUpperCase());
  return title.replace(/\.$/, '').trim();
}

export function formatTask(commitment) {
  return {
    title: makeTaskTitle(commitment.description),
    owner: commitment.owner,
    dueDate: commitment.dueDate || null,
    priority: commitment.priority,
    description: commitment.description,
    source: commitment.source
  };
}

export function formatTasks(commitments) {
  return commitments.map(formatTask);
}
