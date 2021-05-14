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

  const errors = [];

  if (prevVersion === currVersion) {
    errors.push('Version not updated, please run the `version` command');
  }

  const changedFiles = getChangedFiles();
  if (!changedFiles.find(path => path.match('CHANGELOG.md'))) {
    errors.push('Changelog not updated, please run the `changelog` command');
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  console.log(
    chalk.green('Changelog and version both updated, ready to publish!')
  );
}
