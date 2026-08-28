# Feedback Round 015

Date: 2026-08-28

## Scope

- New evidence bundle: `chefs-one-click-tester-v0.4.4-build-2026.08.28.18-run-C30A88-20260828-203140.zip`
- Supplemental evidence: user screenshot of blank automated OrgBook state and exact rendered Choices placeholder DOM
- Form: TEST Import
- Corrected output: Version `0.4.5`, build `2026.08.28.19`
- Criteria version: `evals/criteria.md` version 14
- Method: Complete bundle inventory/inspection, screenshot/DOM/source diagnosis, strengthened targeted regression and full automated regression suite

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Version 0.4.4 run `C30A88` submitted TEST Import with confirmation `5BEA0389`, eight passes, 28 filled fields, one completed attachment, selected Simple BC Address and map location, committed repeating-grid work, and no validation errors. OrgBook remained blank after three reported fill successes.

Each OrgBook success reported a value length of 56. The supplied live DOM proves that this is exactly the length of **Start typing to search BC Registered Businesses database**, the Choices placeholder stored as a selected/deletable item with a non-empty `data-value`. No remote-selection success or failure event was emitted. Source tracing showed that when the runner found no remote result, it fell through to the hidden native select; the generic select path treated that non-empty placeholder option as usable and returned success.

## Corrective output

- OrgBook is opened with a normal click.
- Its cloned search input is cleared, then `wonderful` is typed one character at a time with keyboard and input events.
- The runner waits for non-placeholder remote results before choosing a result.
- A retry uses the same human-equivalent character-by-character process.
- A remote no-result condition logs failure and returns before the native-select fallback.
- Generic native-select filling rejects placeholder-like options even when their value is non-empty.
- The existing continuous 1.2-second selected-state requirement remains in force.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-03 diagnosis | PASS | `C30A88` reports three 56-character OrgBook successes while later snapshots remain empty; the supplied DOM identifies the 56-character selected item as the placeholder. |
| FIELD-03 human-equivalent interaction | PASS (automated) | `autocomplete-editgrid-regression.test.js` requires a normal open, character-by-character keyboard/input event sequence, result wait, result selection and the same retry path. |
| FIELD-03 placeholder exclusion | PASS (automated) | The regression requires the remote no-result branch to return before native fallback and native options to pass placeholder scoring. |
| Existing workplace behaviours | PASS (workplace) | `C30A88` retained address, upload, map, Edit Grid and real-submit behaviour through confirmation `5BEA0389`. |
| FIELD-03 OrgBook workplace behaviour | NOT YET OBSERVED | Version 0.4.5 has not yet been replayed against the live OrgBook control. |

## Next action

Reload version 0.4.5, refresh TEST Import and start a fresh run. Observe OrgBook type `wonderful`, wait for the list, choose a returned business and retain it after the dropdown closes. Export the finalized run bundle for the live verdict.
