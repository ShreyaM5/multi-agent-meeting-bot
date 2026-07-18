# Meeting-to-Action Prototype

A simple JavaScript/Node prototype that turns a meeting transcript into:
- parsed utterances by speaker
- extracted commitments with owners, deadlines, and priority
- formatted tasks in a structured JSON schema
- follow-up email drafts per owner

## Usage

Run the prototype against a transcript file:

```bash
npm start
```

Or with a custom transcript:

```bash
node src/index.js path/to/transcript.txt
```

## Testing

```bash
npm test
```

## Project Links

- Repository: https://github.com/ShreyaM5/multi-agent-meeting-bot

## How it works

- `src/parser.js`: cleans transcript text, removes filler and cross-talk, splits by speaker.
- `src/extractor.js`: scans for commitment sentences and derives owners, due dates, and priority.
- `src/formatter.js`: maps commitments into task objects.
- `src/email.js`: drafts follow-up emails grouped by task owner.
