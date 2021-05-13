import chalk from 'chalk';
import createUtils from './utils.js';

const utils = createUtils();

export default async function verify({
  projectRoot = process.cwd(),
  getCurrentVersion = utils.getCurrentVersion,
  getPreviousVersion = utils.getPreviousVersion,
  getChangedFiles = utils.getChangedFiles,
  // getGitTags = utils.getGitTags,
} = {}) {
  const prevVersion = getPreviousVersion();
  const currVersion = await getCurrentVersion(projectRoot);

  console.log('Previous version:', prevVersion);
  console.log('Current version:', currVersion);
  if (prevVersion === currVersion) {
    throw new Error('Version not updated, please run the `version` command');
  }

  const changedFiles = getChangedFiles();
  if (!changedFiles.find(path => path.match('CHANGELOG.md'))) {
    throw new Error(
      'Changelog not updated, please run the `changelog` command'
    );
  }

  // const gitTags = getGitTags();
  // if (!gitTags.includes(`v${currVersion}`)) {
  //   throw new Error('Git tag not updated, please run the `git-tag` command');
  // }

  console.log(
    chalk.green('Changelog and version both updated, ready to publish!')
  );
}
