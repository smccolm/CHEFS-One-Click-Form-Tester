# Feedback Round 018

Date: 2026-08-28

## Scope

- Source evidence: CHEFS `common-hosted-form-service` commit `f3f8731cbae5d96c81dbc11c5445c9acccd78d91`
- Runtime dependency evidence: Form.io 4.17.4 and `@formio/choices.js` 10.2.0
- Corrected output: Version `0.4.8`, build `2026.08.28.22`
- Criteria version: `evals/criteria.md` version 17

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

CHEFS Business Name Search is a thin subclass of Form.io's stock Select component. Its configuration supplies the OrgBook URL, `q` search field, `results` response path, `value` property, string storage, lazy loading and minimum search length. Form.io owns request construction, result transformation, Choices population and value persistence.

The previous extension path drove the cloned Choices input with synthetic events and then attempted to infer the result DOM. The corrected path instead invokes the live component interface CHEFS itself uses.

## Corrective output

- Locates the matching page-context Form.io OrgBook instance.
- Validates that its configured endpoint is HTTPS `orgbook.gov.bc.ca/api/v3/search/autocomplete`.
- Calls `triggerUpdate('wonderful', true)` and awaits `itemsLoaded`.
- Confirms `WONDERFUL FLOORING` exists in `selectOptions`.
- Calls `setValue('WONDERFUL FLOORING')`, `triggerChange({ modified: true })`, and root `checkData`.
- Requires the rendered selected state to persist continuously for 1.2 seconds.
- Runs the older synthetic Choices path only if the Form.io lifecycle fails.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-03 CHEFS architecture | PASS | CHEFS OrgBook extends Form.io Select and provides configuration only. |
| FIELD-03 primary lifecycle | PASS (automated) | Targeted regression requires Form.io bridge execution before Choices, followed by `triggerUpdate`, `itemsLoaded`, `selectOptions`, `setValue` and `triggerChange`. |
| FIELD-03 exact selection | PASS (automated) | Selection is permitted only when `selectOptions` contains `WONDERFUL FLOORING`. |
| Existing regression baseline | PASS | Full project regressions, JavaScript syntax validation and JSON parsing pass. |
| FIELD-03 workplace behaviour | NOT YET OBSERVED | Version 0.4.8 has not yet been replayed against the live OrgBook control. |

## Next action

Reload version 0.4.8, refresh TEST Import, and start a fresh run. Confirm Registered Business Name retains `WONDERFUL FLOORING` and export the finalized run bundle.
