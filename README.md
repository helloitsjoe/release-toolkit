# Release toolkit CLI

## Commands

- `version`: Upgrades package version using `--patch`, `--minor`, or `--major`

- `changelog`: Updates or creates CHANGELOG.md (requires `version` run first).
  Will prompt for type of change and description unless `--type` and/or
  `--message` args are used. Allowed types:

  - `Feature`
  - `Bug fix`
  - `Chore`
  - `Breaking change`

- `git-tag`: Tags with new version (requires `version` run first)

- `verify`: Verifies `version` and `changelog` have both been run

- `release`: Runs `version`, `changelog`, and `git-tag`

- `publish`: Uses current version to publish to `npm` and create a GitHub
  release by default, either can be skipped with `--no-npm` or `--no-github`
  flags.

## Usage

`relase-toolkit` is designed to be used in GitHub workflows. Here's an example
of a library published to npm, with releases to GitHub:

**GitHub repo**

It's recommended to set branch protection rules in place to prevent code being
pushed directly to `main`. Branch rules should be set up to require all checks
pass before PRs can be merged to `main`.

**verify.yml** makes sure `version` and `changelog` have been updated, and runs
every time code is pushed to any branch other than `main`.

```yml
on:
  push:
    branches-ignore:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: c-hive/gha-yarn-cache@v1
      - run: npx helloitsjoe/release-toolkit verify
      - run: yarn
      - run: yarn test
      - run: yarn build
```

**release.yml** publishes to `npm` and creates a GitHub release every time code
is merged to the `main` branch.

```yml
on:
  push:
    branches:
      - main

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '14.x'
          registry-url: 'https://registry.npmjs.org'
      - uses: c-hive/gha-yarn-cache@v1
      - run: yarn
      - run: yarn test
      - run: yarn build
      - run: npx helloitsjoe/release-toolkit publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
