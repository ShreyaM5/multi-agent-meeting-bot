export function reviewPipeline(utterances, commitments, tasks, emails) {
  const review = [];

  if (tasks.length !== commitments.length) {
    review.push(`Task count (${tasks.length}) does not match commitments count (${commitments.length}).`);
  }

  const ambiguousOwners = tasks.filter((task) => /team$|action owner/i.test(task.owner));
  if (ambiguousOwners.length) {
    review.push(`Found ${ambiguousOwners.length} tasks with ambiguous owner labels; consider assigning a specific person.`);
  }

  const noDeadline = tasks.filter((task) => !task.dueDate);
  if (noDeadline.length) {
    review.push(`There are ${noDeadline.length} action items without an explicit deadline or time window.`);
  }

  const owners = [...new Set(tasks.map((task) => task.owner))];
  if (emails.length !== owners.length) {
    review.push(`Email drafts were generated for ${emails.length} owners, but there are ${owners.length} unique task owners.`);
  }

  review.push(`Parsed ${utterances.length} utterances, extracted ${commitments.length} commitments, and drafted ${tasks.length} tasks.`);

  return review;
}
