# Jira release to GitHub release automation

SCRUM-55 draft path for weekly Jira releases feeding GitHub releases in `cywf/vTOC` and, where needed, the private `cywf/vTOC-AGENT` repository.

## Current safety posture

The workflow in `.github/workflows/jira-release-to-github-release.yml` is intentionally gated:

- `workflow_dispatch` defaults to `dry_run=true`.
- `repository_dispatch` does not create or edit a release unless both conditions are true:
  - repository variable `ENABLE_JIRA_RELEASE_AUTOMATION=true`
  - dispatch payload includes `client_payload.kp_approved=true`
- `release_scope=dev` creates prereleases for weekly interim cuts.
- `release_scope=public` creates a draft GitHub release first, so KP can review release notes before publishing the public S4 `v0.1.0` cut.

This PR does not publish any release or tag by itself.

## Recommended n8n flow

1. Jira trigger: Version Released webhook for the vTOC Jira project/board.
2. Normalize payload: map Jira version fields into a GitHub `repository_dispatch` body.
3. Approval gate: require KP approval before setting `kp_approved=true`.
4. GitHub API call: POST `repos/cywf/vTOC/dispatches` with event type `jira-version-released`.
5. Optional private-agent path: repeat the same dispatch to `cywf/vTOC-AGENT` only for release scopes that include private agent code.

### GitHub dispatch request

Endpoint:

```text
POST https://api.github.com/repos/cywf/vTOC/dispatches
Accept: application/vnd.github+json
Authorization: Bearer <fine-grained GitHub token with Contents: read/write and Actions: write>
X-GitHub-Api-Version: 2022-11-28
```

Body:

```json
{
  "event_type": "jira-version-released",
  "client_payload": {
    "version": {
      "id": "{{ $json.version.id }}",
      "name": "{{ $json.version.name }}",
      "description": "{{ $json.version.description }}",
      "releaseDate": "{{ $json.version.releaseDate }}"
    },
    "jira_project_key": "{{ $json.project.key }}",
    "jira_url": "{{ $json.version.self }}",
    "release_scope": "dev",
    "tag_name": "{{ $json.version.name }}",
    "target_sha": "",
    "dry_run": false,
    "kp_approved": false
  }
}
```

Set `kp_approved=true` only after the approval node completes. Leave it false for initial dry runs and audit-only runs.

## Versioning rules

| Jira release | GitHub tag | Scope | GitHub release type |
| --- | --- | --- | --- |
| S0/S1/S2/S3 weekly interim | sanitized Jira version or explicit dev tag | `dev` | prerelease |
| S4 free-launch cut | `v0.1.0` | `public` | draft release |
| Private agent-only cut | matching private tag | `dev` or `public` by approval | private repo release |

## vTOC-AGENT handling

Because `cywf/vTOC-AGENT` is private, do not make the public `cywf/vTOC` workflow create releases in that repository with broad cross-repo credentials. Preferred options:

1. Copy the same workflow into `cywf/vTOC-AGENT` and have n8n dispatch each repo separately.
2. Use a fine-grained GitHub token in n8n scoped only to `cywf/vTOC-AGENT` for private release dispatches.
3. Keep public and private release notes separate; public `cywf/vTOC` releases should not include private agent implementation details.

## Manual dry-run test

Run from GitHub Actions after merge:

```text
Workflow: Jira Release to GitHub Release
version_name: S0
release_scope: dev
dry_run: true
```

Expected result: the workflow summary prints the release plan and the final step says no tag or GitHub release was created.

## Manual approved test

Only after KP approval:

```text
Workflow: Jira Release to GitHub Release
version_name: S0
tag_name: s0-weekly-dev
release_scope: dev
dry_run: false
```

Expected result: a prerelease named `S0` is created or updated at the selected target SHA.
