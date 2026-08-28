# Feedback Round 019

Date: 2026-08-28

## Scope

- User evidence: screenshots showing v0.4.8 stopped at OrgBook with `WONDERFUL FLOORING` in the Choices search and `No choices to choose from`
- Runtime evidence: complete v0.4.8 run bundles `A7E2A5` and `45DE20`
- Corrected output: Version `0.4.9`, build `2026.08.28.23`
- Criteria version: `evals/criteria.md` version 18

## Overall verdict

`CONDITIONAL — MULTIPLE-ROOT CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Run `45DE20` isolates the failure before any OrgBook request or value application: every native attempt reports `Form.io OrgBook component was not found for orgbook`. The page bridge cached the first discoverable Form.io root and searched only that root. CHEFS can expose more than one Form.io instance on the page, so the correct rendered OrgBook instance was never inspected. The later synthetic Choices behavior in the screenshot was fallback, not the intended primary implementation.

## Corrective output

- Begins discovery at the exact rendered OrgBook wrapper supplied by the content controller.
- Walks the wrapper's Vue/Form.io ownership graph and all bounded live Form.io roots.
- Searches every discovered root and ranks exact wrapper ownership ahead of key-only matches.
- Executes the existing native OrgBook lifecycle on the resolved component.
- Reports PID-free root count, inspected component count and wrapper-match state.
- Retains synthetic Choices only as a fallback.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-03 root resolution | PASS (automated) | Executable fixture caches an unrelated Form.io form first, then resolves and selects OrgBook through its rendered wrapper from a second root. |
| FIELD-03 native lifecycle | PASS (automated) | The fixture asserts `triggerUpdate('wonderful', true)`, returned-option gating, `setValue('WONDERFUL FLOORING')` and successful wrapper binding. |
| FIELD-03 diagnostics | PASS (automated) | The bridge response and run events expose bounded root/component counts and wrapper-match state only. |
| Existing regression baseline | PASS | All eight project regressions, JavaScript syntax checks and packaged JSON parsing pass. |
| FIELD-03 workplace behaviour | NOT YET OBSERVED | Version 0.4.9 has not yet been replayed against TEST Import. |

## Next action

Reload version 0.4.9, refresh TEST Import, and start a fresh run. Confirm Registered Business Name retains `WONDERFUL FLOORING`, then place the finalized export in `feedback/`.
