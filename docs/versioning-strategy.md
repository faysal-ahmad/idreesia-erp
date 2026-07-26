# Versioning Strategy

This repository uses PR labels to drive application package versions and Docker image tags.

## Version Source

The root `package.json` and `idreesia-web/package.json` files are kept at the same version. The initial version is `1.0.0`.

The release workflow updates both files and commits the version change back to the target branch. Because `develop` and `master` require changes through pull requests, the release workflow uses a Personal Access Token (PAT) stored as `GH_PERSONAL_ACCESS_TOKEN` so the version commit and release tag are pushed by an actor that is allowed to bypass the repository rule.

## Labels

Use one of these labels on PRs:

- `major`
- `minor`
- `patch`

If none of these labels is present, the workflow defaults to `patch`.

If multiple labels are present, the highest label wins:

```text
major > minor > patch
```

## Branch Flow

There are two release channels:

- PRs merged into `develop` create release candidate versions.
- PRs merged into `master` promote release candidates to stable versions.

PRs into `master` must come from the `develop` branch in this repository. The build workflow fails master-targeted PRs from any other branch, and the release workflow also refuses to publish direct-to-master PR releases as a backstop.

## Develop: Release Candidates

When a PR is merged into `develop`, the workflow computes the next release candidate version.

Examples:

```text
1.0.0 + patch -> 1.0.0-rc.1   # first release candidate
1.0.0 + minor -> 1.1.0-rc.1
1.1.0-rc.1 + patch -> 1.1.0-rc.2
1.1.0-rc.1 + major -> 2.0.0-rc.1
```

Once the release candidate base has moved up, lower labels do not reduce it. For example, after `2.0.0-rc.1`, another `patch` PR into `develop` produces `2.0.0-rc.2`.

Release candidate Docker images are tagged only with the release candidate version:

```text
ghcr.io/<owner>/idreesia-web:1.2.0-rc.1
```

Release candidates are not tagged as `latest`.

## Master: Stable Releases

When `develop` is merged into `master`, the workflow promotes the current release candidate by removing the `-rc.N` suffix.

Example:

```text
1.2.0-rc.3 -> 1.2.0
```

The labels on a `develop` to `master` PR do not affect the version when the merged package version is already a release candidate. The workflow promotes the release candidate as-is.

Stable Docker images receive these tags:

```text
ghcr.io/<owner>/idreesia-web:1.2.0
ghcr.io/<owner>/idreesia-web:1.2
ghcr.io/<owner>/idreesia-web:1
ghcr.io/<owner>/idreesia-web:latest
```

## Implementation

The versioning logic lives in `scripts/resolve-release-version.mjs`.

The release workflow is `.github/workflows/release.yml`, and the PR validation check is in `.github/workflows/build.yml`.

To fully enforce the master PR restriction, configure the `validate-master-source` check as a required status check in the `master` branch protection rules.
