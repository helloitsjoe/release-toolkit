#!/usr/bin/env node

import fs from 'fs/promises';
import inquirer from 'inquirer';
import path from 'path';
import chalk from 'chalk';

import { getRepo, getDate, getVersion, verifyExists } from './utils.js';

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

const main = async () => {
  const projectRoot = process.cwd();
  const changelogPath = path.join(projectRoot, 'CHANGELOG.md');

  await verifyExists(changelogPath);

  const existingChangelog = await fs.readFile(changelogPath);
  const version = await getVersion(projectRoot);

  if (existingChangelog.includes(`[${version}]`)) {
    throw new Error('Version already exists in changelog, bump version first.');
  }

  const { type, description } = await inquirer.prompt([
    typeQuestion,
    descriptionQuestion,
  ]);

  const newChanges = `
## [${version}](https://github.com/${getRepo()}/releases/tag/v${version}) (${getDate()})

#### ${type}

${description}

${existingChangelog}
`.trim();
  await fs.writeFile(changelogPath, newChanges);
  console.log('Updated changelog!');
};

main().catch(err => {
  console.error(chalk.red(err.stack));
  process.exit(1);
});
