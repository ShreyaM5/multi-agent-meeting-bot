import assert from 'node:assert/strict';
import { parseTranscript } from '../src/parser.js';
import { extractCommitments } from '../src/extractor.js';
import { formatTasks } from '../src/formatter.js';
import { draftEmails } from '../src/email.js';
import { reviewPipeline } from '../src/coordinator.js';

const sample = `Alice: Okay, let's kick off. We need to decide who owns the budget update.
Bob: I can send the updated deck by Friday.
Alice: Great, and can you also follow up with legal on the contract language?
Bob: Yes, I will ask legal and circle back by Monday.
Charlie: Um, I think we should also document the risks in the summary.
Alice: Please share the first draft with the team by next week.`;

const utterances = parseTranscript(sample);
assert.strictEqual(utterances.length, 6, 'should parse six utterances');

const commitments = extractCommitments(utterances);
assert.ok(commitments.length >= 3, 'should extract at least three commitments');
assert.ok(commitments.some((c) => c.owner === 'Bob' && c.dueDate === 'Friday'), "should extract Bob's Friday commitment");

const tasks = formatTasks(commitments);
assert.ok(tasks.every((task) => task.title), 'every task should have a title');

const emails = draftEmails(tasks);
assert.ok(emails.some((email) => email.subject.includes('Bob')), 'should create an email for Bob');

const review = reviewPipeline(utterances, commitments, tasks, emails);
assert.ok(review.length > 0, 'review summary should contain at least one check');

console.log('All tests passed.');
