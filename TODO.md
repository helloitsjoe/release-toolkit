- Change to release-scripts
- Version script (bumps package and package-lock if exists, runs changelog
  unless --no-changelog)
- Verify script (checks changelog and version changed)
- Publish script (publishes to npm and github at current version)
