#!/usr/bin/env node

import chalk from 'chalk';
import changelog from '../lib/changelog.js';
import version from '../lib/version.js';
// import { Command } from 'commander/esm.mjs';
// const program = new Command();

// program.option('-c', '--c')

// console.log(`program:`, program);

const cliCommand = process.argv[2];

const commands = {
  changelog,
  version,
};

if (!cliCommand) {
  console.error(
    chalk.red(
      `Command is required. Options are: ${Object.keys(commands).join(', ')}`
    )
  );
  process.exit(1);
}

const fallback = () =>
  Promise.reject(new Error(`Command ${cliCommand} does not exist`));

const command = commands[cliCommand] || fallback;

command().catch(err => {
  console.error(chalk.red(err.stack));
  process.exit(1);
});
