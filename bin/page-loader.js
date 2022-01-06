#!/usr/bin/env node
import { Command } from 'commander';
import main from '../index.js';

const program = new Command();
program
  .version('0.0.1', '-v, --version', 'output the version number')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")', process.cwd())
  .arguments('<url>')
  .action((url) => {
    const { output } = program.opts();
    main(url, output);
  });

program.parse(process.argv);
