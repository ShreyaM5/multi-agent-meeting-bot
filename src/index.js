import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseTranscript } from './parser.js';
import { extractCommitments } from './extractor.js';
import { formatTasks } from './formatter.js';
import { draftEmails } from './email.js';
import { reviewPipeline } from './coordinator.js';

function loadTranscript(path) {
  return readFileSync(resolve(path), 'utf8');
}

function run(transcriptPath) {
  const rawTranscript = loadTranscript(transcriptPath);
  const utterances = parseTranscript(rawTranscript);
  const commitments = extractCommitments(utterances);
  const tasks = formatTasks(commitments);
  const emails = draftEmails(tasks);
  const review = reviewPipeline(utterances, commitments, tasks, emails);

  console.log('--- Parsed utterances ---');
  console.log(JSON.stringify(utterances, null, 2));
  console.log('\n--- Extracted commitments ---');
  console.log(JSON.stringify(commitments, null, 2));
  console.log('\n--- Formatted tasks ---');
  console.log(JSON.stringify(tasks, null, 2));
  console.log('\n--- Drafted emails ---');
  console.log(JSON.stringify(emails, null, 2));
  console.log('\n--- Review summary ---');
  review.forEach((line) => console.log(`- ${line}`));
}

if (process.argv.length < 3) {
  console.error('Usage: node src/index.js <transcript-file>');
  process.exit(1);
}

run(process.argv[2]);
