#!/usr/bin/env node
import { Command } from 'commander';
import getCurrentPath from '../src/currentPath.js';

const program = new Command();
program
.version('0.0.1', '-v, --version', 'output the version number')
.option('-o, --output [dir] [url]', 'output dir (default: "/home/user/current-dir")', '/home/user/current-dir', 'https://ru.hexlet.io/courses');

program.parse(process.argv);

const options = program.opts();

if (options.output) {
  const currentPath = getCurrentPath(options.output);
  console.log(currentPath)
}
program.parse(process.argv);
