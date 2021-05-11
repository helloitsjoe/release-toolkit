import inquirer from 'inquirer';

import createUtils from './utils.js';

const utils = createUtils();

const typeQuestion = {
  type: 'list',
  name: 'type',
  message: 'Type of change',
  choices: ['Feature', 'Bug fix', 'Breaking changes'],
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
  // if (await fs.access(path.join(projectRoot, 'package.json'))) {
  //   throw new Error('Command must be run from project root');
  // }

  const existingChangelog = await getChangelog(projectRoot);
  const version = await getCurrentVersion(projectRoot);

  if (existingChangelog.includes(`[${version}]`)) {
    throw new Error('Version already exists in changelog, bump version first.');
  }

  const { type, description } = await prompt([
    typeQuestion,
    descriptionQuestion,
  ]);

  const newChanges = `
## [${version}](https://github.com/${getRepo()}/releases/tag/v${version}) (${getDate()})

**${type}**

${description}

${existingChangelog}
`.trim();

  await updateChangelog(projectRoot, newChanges);
  console.log('Updated changelog!');
};

export default changelog;
