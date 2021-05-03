#!/usr/bin/env node

import chalk from 'chalk';
import changelog from './changelog.js';

changelog().catch(err => {
  console.error(chalk.red(err.stack));
  process.exit(1);
});
