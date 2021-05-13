import chalk from 'chalk';
import createUtils from './utils.js';

const utils = createUtils();

export default async function verify({
  projectRoot = process.cwd(),
  getCurrentVersion = utils.getCurrentVersion,
  getPreviousVersion = utils.getPreviousVersion,
  getChangedFiles = utils.getChangedFiles,
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

  console.log(
    chalk.green('Changelog and version both updated, ready to publish!')
  );
}
