import createUtils from './utils.js';

const utils = createUtils();

export default async function publish({
  projectRoot = process.cwd(),
  publishNpm = utils.publishNpm,
  createGitRelease = utils.createGitRelease,
  getCurrentVersion = utils.getCurrentVersion,
  argv,
} = {}) {
  const { dryRun = false } = argv;
  // TODO: Maybe just publish a github release and have CI responsible for publishing to npm?
  // publishNpm({ dryRun });

  const currVersion = await getCurrentVersion(projectRoot);
  await createGitRelease({ version: `v${currVersion}`, dryRun });
}
