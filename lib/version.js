// import inquirer from 'inquirer';
import utils from './utils';

const versionCmd = async ({
  projectRoot = process.cwd(),
  getVersion = utils.getVersion,
  updateVersion = utils.updateVersion,
  // prompt = inquirer.prompt,
}) => {
  const currentVersion = getVersion(projectRoot).split('.');
  const [major, minor, patch] = currentVersion;
  const newVersion = `${major}.${minor}.${parseInt(patch) + 1}`;
  updateVersion(projectRoot, newVersion);
  // console.log('Bumping version...');
};

export default versionCmd;
