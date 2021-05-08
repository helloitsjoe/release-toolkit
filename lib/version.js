import inquirer from 'inquirer';
import createUtils from './utils.js';
import semver from 'semver';

const utils = createUtils();

const versionQuestion = {
  type: 'list',
  name: 'versionBump',
  message: 'Version bump',
  choices: ['major', 'minor', 'patch'],
};

const versionCmd = async ({
  projectRoot = process.cwd(),
  getCurrentVersion = utils.getCurrentVersion,
  updateVersion = utils.updateVersion,
  prompt = inquirer.prompt,
} = {}) => {
  const currentVersion = await getCurrentVersion(projectRoot);
  const { versionBump } = await prompt(versionQuestion);
  updateVersion(projectRoot, semver.inc(currentVersion, versionBump));
  // console.log('Bumping version...');
};

export default versionCmd;
