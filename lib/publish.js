export default async function publish({
  projectRoot = process.cwd(),
  utils,
  argv,
} = {}) {
  const { dryRun = false, npm, github } = argv;
  const {
    publishNpm,
    getCurrentVersion,
    getGitHubInfo,
    getChangelog,
    createGitRelease,
  } = utils;

  if (npm) {
    // TODO: Maybe just publish a github release and have CI responsible for publishing to npm?
    publishNpm({ dryRun });
  }

  if (github) {
    const version = await getCurrentVersion(projectRoot);
    const changelog = await getChangelog(projectRoot);
    const { body } = getGitHubInfo(changelog);
    await createGitRelease({ version, body, dryRun });
  }
}
