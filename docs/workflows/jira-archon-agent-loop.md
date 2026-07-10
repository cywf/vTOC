# Jira ↔ G8S agents ↔ Archon delivery loop

Sprint-0 scope: wire the delivery path and review gates only. This loop does not deploy production changes and does not merge to `main` automatically.

## Loop contract

1. A Jira issue in `SCRUM` is the source task record.
2. Jira labels route the task to the owning G-agent (`agent-g1` … `agent-g8`) and the delivery family (`vtoc`, `infra`, `docs`, `research`, `bug`, `feature`).
3. Hermes/G8S claims the issue and starts the matching Archon workflow in an isolated worktree:
   - worktree branch: `archon/<jira-key>-<slug>`
   - implementation branch: `codex/<jira-key>-<slug>` when code is changed
4. The Archon workflow creates or updates a `codex/*` pull request with the Jira key in the title/body.
5. CI/branch gates must pass before review.
6. Maria is the merge authority after the gate checklist is complete. No agent merges `main` directly during Sprint-0.

## Task-type to Archon workflow map

| Jira signal | Archon workflow | Output branch/PR | Merge authority |
| --- | --- | --- | --- |
| `vtoc` + `feature` or Story | `.archon/workflows/vtoc_mvp_build.yaml` | `codex/<jira-key>-feature-*` PR | Maria after CI + KP/Maria approval |
| `vtoc` + `bug` or Bug | `.archon/workflows/vtoc_mvp_build.yaml` with `task_type=bugfix` | `codex/<jira-key>-bugfix-*` PR | Maria after regression test evidence |
| `docs` or docs-only task | `.archon/workflows/scrum_45_jira_archon_loop.yaml` with `task_type=docs` | `codex/<jira-key>-docs-*` PR | Maria after docs preview/checks |
| `research` | `.archon/workflows/scrum_45_jira_archon_loop.yaml` with `task_type=research` | report artifact; PR only if repository docs change | Maria only if a PR exists |
| `infra` / `sprint-0` orchestration | `.archon/workflows/scrum_45_jira_archon_loop.yaml` with `task_type=orchestration` | mapping/doc/config PR | Maria after branch gates are trustworthy |

## Maria merge authority path

Maria can merge a `codex/*` PR only when all of these are true:

- PR branch name starts with `codex/` or `archon/` and references the Jira key.
- Jira issue is linked in the PR body.
- CI/checks are passing or the failing check is documented as non-blocking.
- Reviewer evidence is present in the PR conversation or Jira comments.
- The PR does not deploy to production, publish containers, or modify protected branch rules unless KP explicitly approved that change.

If any condition fails, Maria leaves the PR open and comments with the missing gate.

## Sprint-0 guardrails

- No production deployment.
- No merge to `main` until CI and branch gates are trusted.
- No secret material in Jira, Archon workflow files, comments, or PR bodies.
- Artifact verification is required before marking Jira or Kanban tasks done: Jira key, workflow file path, PR URL, and CI/check status.
