# CHEFS One-Click Form Tester

## Objective

Build and validate a Chrome-based workplace testing tool that fills every reachable user-facing field in a CHEFS form, resolves validation issues where possible, and submits the form through a one-click workflow.

## Intended users

- Authorized CHEFS testers working in approved non-production environments
- Developers and analysts diagnosing Form.io form behaviour

## Primary deliverable

A usable CHEFS One-Click Form Tester browser extension, its required runtime assets, and concise operating instructions in `output/`.

## Repository association

Repository use is optional. Configure the association and permitted operations in `REPOSITORY.md`.

- Association mode: `NONE`
- Source of truth: `output/`

## Scope

### Included

- Chrome-based extension operation
- Iterative fill-until-full scanning
- Visible and conditionally revealed fields
- Tabs, attachments, data grids, and validation recovery
- Two generated rows for data grids unless a later requirement changes this
- Automatic submission on approved non-production CHEFS domains
- Synthetic test data generation
- CHEFS input-mask support
- Exportable diagnostic and traceability bundles
- Project-level regression-list launcher with explicitly gated sequential extension orchestration

### Not included

- Production CHEFS submission
- Capture of PID or other prohibited personal information
- General-purpose form automation outside the approved CHEFS scope
- Repository initialization or association unless separately configured

## Constraints

- Automatic submission must be restricted to approved non-production CHEFS domains unless explicitly reconfigured.
- Every run must produce exportable troubleshooting data with version, build, session, form, pass, component, validation, submission, error, and confirmation details.
- Browser console output should remain quiet.
- PID must never be captured through instrumentation.
- Generated people, contacts, applicant identities, and personal details must be synthetic.
- Form.io component updates must be triggered when values are set programmatically.

## Assumptions

- The target browser is Chrome or a compatible managed Chromium browser.
- Testing occurs only in an authorized workplace environment.
- Exact approved domains and deployment constraints will be configured before automatic submission is enabled.

## Definition of done

The project is done when:

1. The primary deliverable is complete in `output/`.
2. All required criteria in `evals/criteria.md` pass.
3. The latest Tok report has an overall verdict of `PASS`.
4. No unresolved required changes remain.
5. `STATUS.md` accurately records the completed state.
6. If a repository is associated, the recorded repository revision matches the evaluated output.
