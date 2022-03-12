import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import loadPage from '../src/index.js';

nock.disableNetConnect();
nock.disableNetConnect('127.0.0.1');
let expectFile;
let resivedFile;
let resourceFile;
let outputPath;

beforeEach(async () => {
  outputPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  resivedFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf-8');
  expectFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses-expected.html', 'utf-8');
  resourceFile = await fs.readFile('./__fixtures__/ru-hexlet-io-assets-professions-nodejs.png', 'utf-8');
});

test('async page loading', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, resivedFile);
  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, resourceFile);

  await loadPage('https://ru.hexlet.io/courses', outputPath);
  const file = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses.html',
  ), 'utf-8');
  const resource = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  ), 'utf-8');

  expect(file).toBe(expectFile);
  expect(resource).toBe(resourceFile);
});

test('404', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(404);

  await expect(loadPage('https://ru.hexlet.io/courses', outputPath))
    .rejects.toThrowError('Request failed with status code 404');
});

test('500', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(500);

  await expect(loadPage('https://ru.hexlet.io/courses', outputPath))
    .rejects.toThrowError('Request failed with status code 500');
});

test('not access', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectFile);

  const rootDirPath = '/sys';

  await expect(loadPage('https://ru.hexlet.io/courses', rootDirPath))
    .rejects.toThrow(/EACCES/);
});
