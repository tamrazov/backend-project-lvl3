#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();
program
  .version('0.0.1', '-V, --version', 'output the version number')
  .description('Page loader utility.')
  .option('-o, --output [dir]', 'output dir (default: "/home/user/current-dir")');

program.parse(process.argv);
