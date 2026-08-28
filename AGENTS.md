# Project Working Instructions

These instructions apply to the CHEFS One-Click Form Tester project in addition to workspace-level instructions.

## Project commands

### Setup

```text
node --version
```

### Tik

```text
Not yet defined.
```

### Tok

```text
node .\evals\tests\generated-email-regression.test.js
```

## Working preferences

- Keep the primary deliverable in `output/`.
- Keep the unpacked Chrome extension at the permanent path `output/chefs-one-click-form-tester/`.
- Never add a version number to the application folder name or rename that folder during release advancement.
- Record version and build identity inside the manifest, release documentation, status, and Tok reports.
- Do not modify application files while a user-run Tok is active unless the user explicitly requests an intervention.
- Keep temporary analysis and intermediate artifacts in `work/`.
- Read `REPOSITORY.md` before performing any Git operation.
- Treat repository association and permission to mutate a repository as separate decisions.
- Do not initialize a repository, add a remote, create a branch, commit, push, or open a pull request unless the relevant operation is explicitly permitted in `REPOSITORY.md`.
- When the association mode is `NONE`, do not assume Git is available or required.
- Define or update evaluation criteria before judging an output against them.
- Before recording a Tok result, recursively inventory `feedback/` and inspect every newly supplied evidence bundle.
- Treat a user result summary as an index to the evidence, not a replacement for reading the evidence.
- Never state that detailed evidence was not supplied without checking the feedback folder immediately before reporting.
- Store each completed evaluation as a new, immutable report in `feedback/`.
- Do not silently weaken, remove, or replace agreed criteria.
- Do not claim a criterion passed without recording the verification method and evidence.
- Update `STATUS.md` when the current state, output, repository revision, verdict, next action, or blocker changes.

## Project-specific conventions

- Implement the tester as a loop that scans, fills, triggers Form.io updates, waits for form changes, and rescans until stable or until a configurable safety limit is reached.
- The default workflow fills all reachable user-facing fields, resolves validation issues where possible, and submits automatically.
- Add two rows to data grids unless a newer requirement changes this behaviour.
- Generate values using both the field label and input mask.
- Treat mask symbol `9` as numeric, `a` as alphabetic, and `*` as alphanumeric.
- Build instrumentation and build traceability from the first implementation.
- Capture diagnostics internally and export them as a troubleshooting bundle.
- Keep routine browser console output quiet.

## Guardrails

- Restrict automatic submission to explicitly approved non-production CHEFS domains.
- Never capture PID through instrumentation.
- Never use real personal information in generated submissions.
- Never store credentials, access tokens, secrets, or production-sensitive values.
- Do not claim fill, validation, diagnostic export, or submission behaviour works without recorded Tok evidence.

## Required verification

- See `evals/criteria.md`.
- Verify domain restrictions before any automatic submission test.
- Verify the diagnostic bundle contains no PID.
