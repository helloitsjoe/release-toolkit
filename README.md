# Release toolkit CLI

If you would like to read about how this toolkit was made, start with [this
blog
post](https://helloitsjoe.github.io/blog/2021-05-04-making-a-release-toolkit-part-1-changelog/).

## Commands

- **`version`**: Upgrades package version using `--patch`, `--minor`, or
  `--major`

- **`changelog`**: Updates or creates CHANGELOG.md (requires `version` run
  first). Will prompt for type of change and description unless `--type` and/or
  `--message` args are used. Allowed types:

  - `Feature`
  - `Bug fix`
  - `Chore`
  - `Breaking change`

- **`release`**: Runs `version` and `changelog`

- **`verify`**: Verifies package version and CHANGELOG.md have both been updated

- **`publish`**: Uses current version to publish to `npm` and create a GitHub
  release by default, either can be skipped with `--no-npm` or `--no-github`
  flags.

## Usage

`relase-toolkit` is designed to be used in GitHub workflows.

**Example GitHub repo**

Here's an example library. This example uses [branch
protection rules](https://docs.github.com/en/github/administering-a-repository/about-protected-branches) which:

1. Prevent code being pushed directly to the `main` branch
2. Prevent branches from being merged until they have passing pipelines

<img width="828" alt="Screen Shot 2021-05-16 at 8 57 32 PM" src="https://user-images.githubusercontent.com/8823810/118419197-5fdc9b00-b689-11eb-9ae3-c9203fac38c6.png">

You might also want to enable `Require pull request reviews` depending on your setup.

**Example workflow pipelines**

These pipeline configs live in the `.github/workflows` directory. When all pipelines
have passed and the branch is merged into `main`, the new version of the library is
automatically published to `npm` and a GitHub release is created.

**verify.yml** runs every time code is pushed to any branch _other than_ `main`,
making sure `version` and `changelog` have been updated, and verifies that the build
and unit tests pass. If any of these fail, the branch won't merge to `main`.

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
      - run: npx helloitsjoe/release-toolkit verify
      - run: yarn
      - run: yarn test
      - run: yarn build
```

**release.yml** runs every time a branch is merged to `main`. At that point all verification
and tests have passed, so it automatically publishes to `npm` and creates a GitHub release.
For authentication, it uses environment variables set in the GitHub repo's `secrets` section.

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
      - run: yarn build
      - run: npx helloitsjoe/release-toolkit publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
