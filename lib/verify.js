import chalk from 'chalk';
import semver from 'semver';

export default async function verify({
  projectRoot = process.cwd(),
  utils,
} = {}) {
  const { getCurrentVersion, getPreviousVersion, getChangedFiles } = utils;
  const prevVersion = getPreviousVersion();
  const currVersion = await getCurrentVersion(projectRoot);

  console.log('Previous version:', prevVersion);
  console.log('Current version:', currVersion);

  const errors = [];

  // gte: prevVersion >= currVersion
  if (semver.gte(prevVersion, currVersion)) {
    errors.push('Version not updated, please run the `version` command');
  }

  const changedFiles = getChangedFiles();
  console.log(`changedFiles:`, changedFiles);

  if (!changedFiles.find((path) => path.match('CHANGELOG.md'))) {
    errors.push('Changelog not updated, please run the `changelog` command');
  }

  if (errors.length) {
    throw new Error(errors.join('\n'));
  }

  console.log(
    chalk.green('Changelog and version both updated, ready to publish!')
  );
}
