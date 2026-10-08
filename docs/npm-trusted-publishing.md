# npm Trusted Publishing

This repository publishes to npm from [`.github/workflows/publish.yml`](../.github/workflows/publish.yml) using OpenID Connect. No long-lived npm token is stored in GitHub.

## One-time npm setup

1. Sign in to [npmjs.com](https://www.npmjs.com/) as the maintainer of `eslint-plugin-no-em-dash`.
2. Open **Package settings** for `eslint-plugin-no-em-dash`.
3. Enable **Trusted publishing** (or **Provenance** / GitHub Actions integration, depending on npm UI).
4. Add a trusted publisher:
   - Provider: GitHub Actions
   - Repository: `ravidorr/eslint-plugin-no-em-dash`
   - Workflow filename: `publish.yml`
   - Environment: leave empty unless you add a GitHub Environment later

Save the configuration. The next merged pull request that passes release checks and has an approving review will publish automatically.

## What triggers a publish

- The pull request is merged (not merely closed).
- The merged pull request has an approving review from someone other than the author.
- Release metadata validation passes for the merge commit.
- CI checks in the publish workflow pass.

Owner bypass of branch protection does not bypass the approval requirement for publishing.
