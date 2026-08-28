# Tok Report: Round 005

Date: 2026-07-23
Evaluator: User visual inspection of extension Settings

## Output tested

- Path: `output/chefs-one-click-form-tester/`
- Output identifier, version, build, or commit: Version `0.2.4`, build `2026.07.23.9`
- Repository association mode: `NONE`
- Repository revision, if applicable: Not applicable.
- Uncommitted changes included: `NOT APPLICABLE`

## Evaluation definition

- Criteria version: `evals/criteria.md` version 4
- Evidence: User-supplied screenshot of the v0.2.4 Export settings section and written Tok findings

## Overall verdict

`FAIL`

## Findings

1. **Required:** The product default and guidance are overfit to the development environment. The Export folder field is labelled **Export folder inside Downloads**, is preloaded with `Downloads Bridge 1`, and describes that local bridge as verified for the installation. A multi-user extension must default this optional setting to blank and use environment-neutral wording.
2. **Required:** The field label must be **Export Folder**.
3. **Required:** Blank-folder behaviour must be treated as the expected common configuration and explicitly verified to route exports directly to the browser's normal Downloads folder.
4. **Required:** Automatic export must run after finalized failure and success outcomes, not only after successful submission.
5. **Required:** The checkbox label and explanatory text must describe run-completion behaviour rather than successful-submission-only behaviour.

## Required changes

1. Remove the development junction alias from defaults and user-facing product guidance.
2. Rename the field to **Export Folder** and document blank as the normal Downloads-folder behaviour.
3. Generalize the setting and lifecycle from post-submit automatic export to post-run automatic export.
4. Finalize failure diagnostics, including screenshots and terminal checkpoints, before requesting automatic export.
5. Extend regressions to cover blank defaults, blank-path downloads, every terminal outcome, duplicate prevention and evidence ordering.

## Limitations

- The user stopped at Settings inspection because the visible portability defect invalidated the build.
- Manual and automatic download routing were not executed for v0.2.4.
