#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import loadingPage from '../src/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const { version } = JSON.parse(readFileSync(path.resolve(__dirname, '../package.json')));

const program = new Command();

program
  .version(version, '-v, --version', 'output the version number')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .arguments('<url>')
  .action((url) => {
    const { output } = program.opts();
    loadingPage(url, output)
      .then((outPath) => console.log(outPath))
      .catch((err) => {
        console.error(err.message);
        process.exit(1);
      });
  });

program.parse(process.argv);
