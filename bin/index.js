#!/usr/bin/env node

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

const argv = (() => {
  if (command === changelog) {
    program
      .option('-t, --type <type>', 'Type of change')
      .option('-m, --message', 'Description of change')
      .parse(process.argv);

    return program.opts();
  } else if (command === version) {
    program
      .option('--patch', 'Patch')
      .option('--minor', 'Minor')
      .option('--major', 'Major')
      .option('--no-changelog', 'Skips automatic changelog')
      .parse(process.argv);

    return program.opts();
  }
})();

console.log(`argv:`, argv);

command({ argv }).catch(err => {
  console.error(chalk.red(err.stack));
  process.exit(1);
});
