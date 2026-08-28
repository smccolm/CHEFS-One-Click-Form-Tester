# Output

## Current deliverable

- Application: CHEFS One-Click Form Tester
- Version: `0.4.9`
- Build: `2026.08.28.23`
- Stable application path: `chefs-one-click-form-tester/`
- Installation and usage: `chefs-one-click-form-tester/README.md`

The stable application folder is the permanent target for Chrome's **Load unpacked** configuration. Its name must not change when the application version changes.

Version and build identity are maintained inside the application manifest and release documentation.

Portable custom format rule exports are user-controlled configuration intended to remain usable across extension versions.

Run-bundle exports use an optional validated Downloads-relative folder configured in extension Settings. The portable default is blank, which uses Downloads directly. When enabled, automatic export creates one finalized bundle after every terminal run outcome.

Build `2026.08.28.23` resolves OrgBook from the exact rendered wrapper across every discoverable live Form.io root, then uses CHEFS's actual Select lifecycle—remote update, items-loaded promise, returned-option verification, component value setting and change propagation—before any synthetic Choices fallback. It retains placeholder exclusion, the selected-state persistence gate, bounded uploads, responsive Stop Run, and optional-component/Edit Grid work.
