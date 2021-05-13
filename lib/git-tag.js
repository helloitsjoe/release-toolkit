import createUtils from './utils.js';

const utils = createUtils();

export default async function tag({
  projectRoot = process.cwd(),
  createGitTag = utils.createGitTag,
  getPreviousVersion = utils.getPreviousVersion,
  getCurrentVersion = utils.getCurrentVersion,
} = {}) {
  const prevVersion = getPreviousVersion();
  const currVersion = await getCurrentVersion(projectRoot);

  if (prevVersion === currVersion) {
    throw new Error('Version not updated, please run the `version` command');
  }
  createGitTag({ version: currVersion });
};
