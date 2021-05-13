#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import changelog from '../lib/changelog.js';
import version from '../lib/version.js';
import verify from '../lib/verify.js';
import { Command } from 'commander/esm.mjs';
const program = new Command();

const cliCommand = process.argv[2];

const commands = {
  changelog,
  version,
  verify,
};

if (!cliCommand) {
  const options = Object.keys(commands).join(', ');
  const message = `Command is required. Options are: ${options}`;
  console.error(chalk.red(message));
  process.exit(1);
}

try {
  fs.accessSync(path.join(process.cwd(), 'package.json'));
} catch (err) {
  console.error(chalk.red('Command must be run from project root'));
  process.exit(1);
}

const fallback = () =>
  Promise.reject(new Error(`Command ${cliCommand} does not exist`));

const command = commands[cliCommand] || fallback;

const argv = (() => {
  if (command === changelog) {
    program
      .option('-t, --type <type>', 'Type of change')
      .option('-m, --message', 'Description of change')
      .parse(process.argv);
  } else if (command === version) {
    program
      .option('--patch', 'Patch')
      .option('--minor', 'Minor')
      .option('--major', 'Major')
      .parse(process.argv);
  }

  return program.opts();
})();

if (cliCommand === 'release') {
  version()
    .then(() => changelog())
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  command({ argv }).catch(err => {
    console.error(chalk.red(err.stack));
    process.exit(1);
  });
}
