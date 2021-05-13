import inquirer from 'inquirer';
import chalk from 'chalk';

import createUtils from './utils.js';

const utils = createUtils();

const typeQuestion = {
  type: 'list',
  name: 'type',
  message: 'Type of change',
  choices: ['Feature', 'Bug fix', 'Chore', 'Breaking changes'],
};

const descriptionQuestion = {
  type: 'editor',
  name: 'description',
  message: 'Describe your changes',
};

const changelog = async ({
  projectRoot = process.cwd(),
  getChangelog = utils.getChangelog,
  getCurrentVersion = utils.getCurrentVersion,
  getRepo = utils.getRepo,
  getDate = utils.getDate,
  updateChangelog = utils.updateChangelog,
  prompt = inquirer.prompt,
} = {}) => {
  const existingChangelog = await getChangelog(projectRoot);
  const version = await getCurrentVersion(projectRoot);

  if (existingChangelog.includes(`[${version}]`)) {
    throw new Error('Version already exists in changelog, bump version first.');
  }

  const { type, description } = await prompt([
    typeQuestion,
    descriptionQuestion,
  ]);

  const newChanges = `## [${version}](https://github.com/${getRepo()}/releases/tag/v${version}) (${getDate()})

**${type}**

${description.trim()}

${existingChangelog}`.trim() + '\n';

  await updateChangelog(projectRoot, newChanges);
  console.log(chalk.green('Updated changelog!'));
};

export default changelog;
