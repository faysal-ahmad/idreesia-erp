# Versioning Strategy

This repository uses PR labels to drive application package versions. Docker images are published only from `master`.

## Version Source

The root `package.json` and `idreesia-web/package.json` files are kept at the same version. The initial version is `1.0.0`.

The release workflow runs on pushes to `develop` and `master`, resolves the merged PR from the pushed merge commit, and keeps both package files in sync.

On `develop`, the workflow updates both files and commits the next version back to `develop`. Because `develop` requires changes through pull requests, the workflow uses a Personal Access Token (PAT) stored as `GH_PERSONAL_ACCESS_TOKEN` so the version commit can be pushed by an actor that is allowed to bypass the repository rule.

On `master`, the workflow uses the version already present in the merged package files. It does not update package files or commit a release version back to `master`.

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

There are two release actions:

- PRs merged into `develop` increment the package version using the PR label.
- PRs merged into `master` publish the package version that was already merged from `develop`.

PRs into `master` must come from the `develop` branch in this repository. The build workflow fails master-targeted PRs from any other branch, and the release workflow also refuses to publish direct-to-master PR releases as a backstop.

## Develop: Version Bumps

When a PR is merged into `develop`, the workflow computes the next plain semver version and commits it to `develop`.

Examples:

```text
1.0.0 + patch -> 1.0.1
1.0.0 + minor -> 1.1.0
1.1.0 + patch -> 1.1.1
1.1.0 + major -> 2.0.0
```

During migration away from release candidate versions, an existing `-rc.N` package version is normalized by removing the suffix. For example, `1.2.0-rc.3` becomes `1.2.0`.

`develop` releases do not create GitHub tags and do not build or push Docker images.

## Master: Stable Releases

When `develop` is merged into `master`, the workflow uses the package version from `develop` as-is.

Example:

```text
develop package version 1.2.0 -> master tag v1.2.0
```

The labels on a `develop` to `master` PR do not affect the version. Master does not change package files; it only creates the GitHub tag and publishes Docker images using the merged package version.

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
