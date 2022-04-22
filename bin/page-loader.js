#!/usr/bin/env node
import { Command } from 'commander';
import loadingPage from '../src/index.js';

const program = new Command();
program
  .version('0.0.1', '-v, --version', 'output the version number')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url) => {
    const { output } = program.opts();
    loadingPage(url, output)
      .then((path) => console.log(path))
      .catch((err) => {
        console.error(err.message);
        process.exit(1);
      });
  });

program.parse(process.argv);
