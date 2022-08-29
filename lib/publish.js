export default async function publish({ utils, argv } = {}) {
  const { dryRun = false, npm, github } = argv;
  const { publishNpm, createGitRelease } = utils;

  if (npm) {
    // TODO: Maybe just publish a github release and have CI responsible for publishing to npm?
    publishNpm({ dryRun });
  }

  if (github) {
    await createGitRelease({ dryRun });
  }
}
