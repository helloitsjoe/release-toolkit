#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import changelog from '../lib/changelog.js';
import publish from '../lib/publish.js';
import version from '../lib/version.js';
import verify from '../lib/verify.js';
import { Command } from 'commander/esm.mjs';

const release = ({ argv }) => version({ argv }).then(() => changelog({ argv }));

const program = new Command();

const cliCommand = process.argv[2];

const commands = {
  release,
  changelog,
  version,
  publish,
  verify,
};

try {
  fs.accessSync(path.join(process.cwd(), 'package.json'));
} catch (err) {
  throw new Error('Command must be run from project root');
}

const cliOptions = Object.keys(commands).join(', ');

if (!cliCommand) {
  throw new Error(`Command is required. Options are: ${cliOptions}`);
}

const command = commands[cliCommand];

if (!command) {
  throw new Error(`Invalid command ${cliCommand}. Options are: ${cliOptions}`);
}

const argv = (() => {
  if (command === changelog) {
    program
      .option('-t, --type <type>', 'Type of change')
      .option('-m, --message <message>', 'Description of change')
      .parse(process.argv);
  } else if (command === version) {
    program
      .option('--patch', 'Patch')
      .option('--minor', 'Minor')
      .option('--major', 'Major')
      .parse(process.argv);
  } else if (command === 'release') {
    // Probably a better way to do this than duplicate
    program
      .option('-t, --type <type>', 'Type of change')
      .option('-m, --message <message>', 'Description of change')
      .option('--patch', 'Patch')
      .option('--minor', 'Minor')
      .option('--major', 'Major')
      .parse(process.argv);
  } else if (command === publish) {
    program
      .option('--dry-run', 'Dry run')
      .option('--no-npm', 'Do not publish npm')
      .option('--no-github', 'Do not publish GitHub')
      .parse(process.argv);
  }

  return program.opts();
})();

command({ argv }).catch(err => {
  console.error(chalk.red(err.stack));
  process.exit(1);
});
