# Release toolkit CLI

## Commands

- `version`: Upgrades package version using `--patch`, `--minor`, or `--major`

- `changelog`: Updates or creates CHANGELOG.md (requires `version` run first)

- `git-tag`: Tags with new version (requires `version` run first)

- `verify`: Verifies `version` and `changelog` have both been run

- `release`: Runs `version`, `changelog`, and `git-tag`
