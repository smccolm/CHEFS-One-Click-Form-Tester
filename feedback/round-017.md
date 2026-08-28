# Feedback Round 017

Date: 2026-08-28

## Scope

- Supplemental evidence: live v0.4.6 screenshot showing the OrgBook editor containing `wonderful` and rendering **No choices to choose from**
- User-requested interaction: insert `WONDERFUL FLOORING`, then press Enter
- Form: TEST Import
- Corrected output: Version `0.4.7`, build `2026.08.28.21`
- Criteria version: `evals/criteria.md` version 16

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

The screenshot establishes that generic query entry can leave the custom Choices UI in an explicit no-choice state even though prior network evidence showed valid returned results. The corrected build therefore stops depending on generic-query result navigation.

## Corrective output

- Types the exact evidenced returned string `WONDERFUL FLOORING` character by character.
- Presses Enter directly after the remote response wait; it does not require ArrowDown.
- If Choices does not persist the value, the restricted page-context fallback searches for and applies only the exact `WONDERFUL FLOORING` result.
- Retains the exact HTTPS OrgBook endpoint restriction, placeholder rejection and continuous selected-state check.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| FIELD-03 exact entry | PASS (automated) | Targeted regression requires `WONDERFUL FLOORING`, direct Enter and matching fallback preference. |
| FIELD-03 fallback match | PASS (automated) | Page-bridge regression requires exact returned-value equality before `component.setValue`. |
| Existing regression baseline | PASS | All eight project regressions, JavaScript syntax validation and packaged JSON parsing pass. |
| FIELD-03 workplace behaviour | NOT YET OBSERVED | Version 0.4.7 has not yet been replayed against the live OrgBook control. |

## Next action

Reload version 0.4.7, refresh TEST Import and start a fresh run. Confirm Registered Business Name retains `WONDERFUL FLOORING` after Enter and through submission, then export the finalized run bundle.
