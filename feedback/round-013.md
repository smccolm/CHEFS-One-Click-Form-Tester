# Feedback Round 013

Date: 2026-08-28

## Scope

- Evidence: User-supplied screenshot of active version `0.4.2` run `01FEF0`
- Form: TEST Import
- Observed state: Pass 1, 15 fields filled, 19 remaining, current action `Uploading simplefile`
- Corrected output: Version `0.4.3`, build `2026.08.28.17`
- Criteria version: `evals/criteria.md` version 12
- Method: Screenshot inspection, upload/bridge/stop lifecycle source diagnosis, targeted executable regression and full automated regression suite

## Overall verdict

`CONDITIONAL — AUTOMATED CORRECTION PASS; WORKPLACE REPLAY REQUIRED`

Run `01FEF0` displayed `chefs-attachment.pdf` but also a visible **Starting upload** progress row. The extension entered the Form.io upload API before its rendered drop strategy and could wait 90 seconds for that bridge request. The filename alone was also eligible to count as a completed upload even while progress remained pending.

Stop Run only set `stopRequested`. It did not reject the pending bridge promise or start stopped-run finalization, so the popup continued to show the active upload until the field timeout returned control to the main loop.

## Corrective output

- A file row remains incomplete while a pending message or incomplete visible progress indicator is present.
- The rendered drop path runs before the potentially blocking Form.io component API.
- One cumulative 20-second deadline follows the same pending upload across passes.
- A timed-out pending upload is not redispatched through the API fallback and releases the loop to later fields.
- Upload polling checks cancellation every 250 ms.
- Stop Run rejects all pending page-bridge promises and begins idempotent stopped finalization immediately.
- The background finalizes the stored run through normal post-processing when a refreshed/reloaded tab has no responsive content controller.
- Field handling propagates cancellation instead of recording an ordinary fill failure.
- The popup requires a stop acknowledgement and refreshes until the run leaves active state.

## Verification

| Criterion | Result | Evidence |
| --- | --- | --- |
| UPLOAD-01 | PASS (automated) | `upload-stop-regression.test.js` proves pending-versus-complete rendering, cumulative 20-second bounds, DOM-first ordering, no pending-upload redispatch and timeout diagnostics. |
| STOP-01 | PASS (automated) | The same regression proves bridge rejection, cancellation propagation, immediate idempotent finalization, orphaned-run background fallback and popup terminal-state refresh. |
| Existing regression baseline | PASS | All eight project regression files passed; all 17 shipped/evaluation JavaScript files passed syntax validation; all five packaged JSON files parsed. |
| UPLOAD-01 / STOP-01 workplace behaviour | NOT YET OBSERVED | Version 0.4.3 has not yet been replayed or manually stopped during a slow upload. |

## Next action

Reload version 0.4.3, refresh TEST Import to clear run `01FEF0`, and run again. If the upload service remains stuck, the runner should record the timeout after at most 20 seconds and proceed to Search Location and the Edit Grid. In a separate replay, select Stop Run during **Starting upload** and confirm the popup changes promptly to **Stopped**. Supply the finalized export(s) for the live verdict.
