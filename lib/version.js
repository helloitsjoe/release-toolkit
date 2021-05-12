import inquirer from 'inquirer';
import semver from 'semver';
import chalk from 'chalk';
import createUtils from './utils.js';

const utils = createUtils();

const versionQuestion = {
  type: 'list',
  name: 'versionBump',
  message: 'Version bump',
  choices: ['major', 'minor', 'patch'],
};

const getVersionBump = (argv = {}) => {
  // Prefer major, then minor, then patch
  if (argv.major) return 'major';
  if (argv.minor) return 'minor';
  if (argv.patch) return 'patch';
  return null;
};

const versionCmd = async ({
  projectRoot = process.cwd(),
  getCurrentVersion = utils.getCurrentVersion,
  updateVersion = utils.updateVersion,
  prompt = inquirer.prompt,
  argv,
} = {}) => {
  const currentVersion = await getCurrentVersion(projectRoot);
  let versionBump = getVersionBump(argv);
  if (!versionBump) {
    ({ versionBump } = await prompt(versionQuestion));
  }
  const newVersion = semver.inc(currentVersion, versionBump);
  await updateVersion(projectRoot, newVersion);
  console.log(chalk.green(`${currentVersion} -> ${newVersion}`));
};

export default versionCmd;
