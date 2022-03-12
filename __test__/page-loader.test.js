import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import loadPage from '../src/index.js';

nock.disableNetConnect();

let expectFile;
let resivedFile;
let resourceFilePng;
let resourceFileJS;
let resourceFileCss;
let resourceFileHTML;
let outputPath;

beforeEach(async () => {
  outputPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  resivedFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf-8');
  expectFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses-expected.html', 'utf-8');
  resourceFilePng = await fs.readFile('./__fixtures__/ru-hexlet-io-assets-professions-nodejs.png', 'utf-8');
  resourceFileJS = await fs.readFile('./__fixtures__/runtime.js', 'utf-8');
  resourceFileCss = await fs.readFile('./__fixtures__/application.css', 'utf-8');
  resourceFileHTML = await fs.readFile('./__fixtures__/cources.html', 'utf-8');
});

test('async page loading', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, resivedFile);
  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, resourceFilePng);
  nock('https://ru.hexlet.io')
    .get('/packs/js/runtime.js')
    .reply(200, resourceFileJS);
  nock('https://ru.hexlet.io')
    .get('/assets/application.css')
    .reply(200, resourceFileCss);
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, resourceFileCss);

  await loadPage('https://ru.hexlet.io/courses', outputPath);
  const file = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses.html',
  ), 'utf-8');
  const resourcePng = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  ), 'utf-8');
  const resourceJs = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
  ), 'utf-8');
  const resourceCss = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  ), 'utf-8');
  const resourceHTML = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
  ), 'utf-8');

  expect(file).toBe(expectFile);
  expect(resourcePng).toBe(resourceFilePng);
  expect(resourceJs).toBe(resourceFileJS);
  expect(resourceCss).toBe(resourceFileCss);
  expect(resourceHTML).toBe(resourceFileHTML);
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

test('no connection', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .replyWithError('Network Error');

  await expect(loadPage('https://ru.hexlet.io/courses', outputPath))
    .rejects.toThrowError('Network Error');
});
