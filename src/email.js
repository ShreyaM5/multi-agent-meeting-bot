function buildSummary(tasks) {
  return tasks
    .map((task, index) => {
      const due = task.dueDate ? ` (due ${task.dueDate})` : '';
      return `${index + 1}. ${task.title}${due} — ${task.description}`;
    })
    .join('\n');

}

export function draftEmails(tasks) {
  const grouped = tasks.reduce((map, task) => {
    const owner = task.owner || 'Team';
    if (!map.has(owner)) {
      map.set(owner, []);
    }
    map.get(owner).push(task);
    return map;
  }, new Map());

  const emails = [];

  for (const [owner, ownerTasks] of grouped.entries()) {
    const subject = `Follow-up: action items for ${owner}`;
    const body = `Hi ${owner},\n\n` +
      `Here are the action items from the meeting that you should own:\n\n` +
      `${buildSummary(ownerTasks)}\n\n` +
      `If anything needs to be adjusted, feel free to reply and I can update the list.`;

    emails.push({ owner, subject, body });
  }

  return emails;
}
