#!/usr/bin/env node

import fs from 'fs/promises';
import cp from 'child_process';
import path from 'path';
import chalk from 'chalk';
const { argv } = process;

console.log(argv);
// console.log(import.meta);

const main = async () => {
  const projectRoot = process.cwd();
  const changelogPath = path.join(projectRoot, 'CHANGELOG.md');

  try {
    await fs.access(changelogPath);
  } catch (err) {
    console.log('CHANGELOG.md does not exist, creating...');
    await fs.writeFile(changelogPath, '');
  }

  const existingChangelog = await fs.readFile(changelogPath);
  const packageJson = await fs
    .readFile(path.join(projectRoot, 'package.json'))
    .then(JSON.parse);
  const currentVersion = packageJson.version;

  if (existingChangelog.includes(`## [${currentVersion}]`)) {
    throw new Error('Version already exists in changelog');
  }

  const repo = cp.execSync('git remote get-url origin', { encoding: 'utf8' });
  const repoName = repo.slice(repo.indexOf(':') + 1, repo.indexOf('.git'));

  const type = 'Feature';
  const description = '- Something special';

  const newChanges = `
## [${currentVersion}](https://github.com/${repoName}/releases/tag/v${currentVersion}) (${formatDate()})

#### ${type}

${description}

${existingChangelog}
`.trim();
  await fs.writeFile(changelogPath, newChanges);
  console.log('Updated changelog!');
};

const formatDate = (date = new Date()) => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(num => num.toString().padStart(2, '0'))
    .join('-');
};

main().catch(err => {
  console.error(chalk.red(err));
  process.exit(1);
});
