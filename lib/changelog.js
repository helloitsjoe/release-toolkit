import inquirer from 'inquirer';
import chalk from 'chalk';

export const getType = (typeFromCli = '') => {
  return {
    feat: 'Feature',
    feature: 'Feature',
    chore: 'Chore',
    bugfix: 'Bug fix',
    'bug fix': 'Bug fix',
    'bug-fix': 'Bug fix',
    bug: 'Bug fix',
    fix: 'Bug fix',
    break: 'Breaking changes',
    breaking: 'Breaking changes',
  }[typeFromCli.toLowerCase()];
};

const typeQuestion = {
  type: 'list',
  name: 'type',
  message: 'Type of change',
  choices: ['Feature', 'Bug fix', 'Chore', 'Breaking changes'],
};

const messageQuestion = {
  type: 'editor',
  name: 'message',
  message: 'Describe your changes',
};

const changelog = async ({
  projectRoot = process.cwd(),
  prompt = inquirer.prompt,
  argv = {},
  utils,
} = {}) => {
  const { getChangelog, getCurrentVersion, getRepo, getDate, updateChangelog } =
    utils;
  const existingChangelog = await getChangelog(projectRoot);
  const version = await getCurrentVersion(projectRoot);

  const { type: typeFromCli, message: messageFromCli } = argv;

  if (existingChangelog.includes(`[${version}]`)) {
    throw new Error('Version already exists in changelog, bump version first.');
  }

  const { type, message } = await prompt([typeQuestion, messageQuestion], {
    type: getType(typeFromCli),
    message: messageFromCli,
  });

  const newChanges =
    `## [${version}](https://github.com/${getRepo()}/releases/tag/v${version}) (${getDate()})

**${type}**

${message.trim()}

${existingChangelog}`.trim() + '\n';

  await updateChangelog(projectRoot, newChanges);
  console.log(chalk.green('Updated changelog!'));
};

export default changelog;
