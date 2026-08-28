# Repository Association

Repository association is optional. This file records whether the project is connected to Git and which Git operations are authorized.

Association does not by itself authorize repository changes.

## Association mode

Current mode: `DEDICATED`

Choose exactly one mode during project setup:

| Mode | Meaning |
| --- | --- |
| `NONE` | The project has no Git repository association. |
| `PARENT` | The project is tracked within a repository whose root is above the project folder. |
| `DEDICATED` | The project folder is the root of its own repository. |
| `EXTERNAL` | The project output or source is associated with a repository outside the project folder. |

## Repository details

Complete these fields when the mode is not `NONE`.

- Repository name: `CHEFS-One-Click-Form-Tester`
- Local repository root: `C:\Local Data\Codex-Workspace\Project - CHEFS-One-Click-Form-Tester`
- Remote URL: `https://github.com/smccolm/CHEFS-One-Click-Form-Tester.git`
- Default branch: `main`
- Relevant repository subpath: `/`
- Relationship to this project: This project folder is the dedicated working tree for the GitHub repository.
- Source of truth: `output/`
- Other source of truth:

The local repository root must be an exact path. Repository association does not override workspace or filesystem access boundaries.

## Permitted operations

Set each value explicitly to `YES` or `NO`.

| Operation | Permitted |
| --- | --- |
| Inspect status and history | `YES` |
| Create or switch branches | `YES` |
| Stage changes | `YES` |
| Create commits | `YES` |
| Pull or fetch | `YES` |
| Push changes | `YES` |
| Create or update pull requests | `NO` |
| Initialize a new repository | `YES` |
| Add or change remotes | `YES` |

## Traceability

When a repository is associated:

1. Record the branch and revision in `STATUS.md`.
2. Record the tested revision in each Tok report.
3. State whether uncommitted changes were included in the evaluation.
4. Do not describe an output as repository-backed unless the recorded revision can be resolved.

When no repository is associated:

1. Use an output identifier, version, build ID, date, or checksum as appropriate.
2. Record that identifier in `STATUS.md` and each Tok report.
3. Do not make Git a completion requirement.

## Setup notes

- Association configured at the user's request on 2026-08-28.
- Routine synchronization must not force-push. Any future history rewrite requires separate explicit approval.
