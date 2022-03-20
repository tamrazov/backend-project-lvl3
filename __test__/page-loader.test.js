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

const fetchFixtureFile = async (src) => fs.readFile(`./__fixtures__/${src}`, 'utf-8');

beforeEach(async () => {
  outputPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  resivedFile = await fetchFixtureFile('ru-hexlet-io-courses.html');
  expectFile = await fetchFixtureFile('ru-hexlet-io-courses-expected.html');
  resourceFilePng = await fetchFixtureFile('ru-hexlet-io-assets-professions-nodejs.png');
  resourceFileJS = await fetchFixtureFile('ru-hexlet-io-packs-js-runtime.js');
  resourceFileCss = await fetchFixtureFile('ru-hexlet-io-assets-application.css');
  resourceFileHTML = await fetchFixtureFile('ru-hexlet-io-courses_file.html');

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

  nock('https://ru.hexlet.io')
    .get('/courses/404')
    .reply(404);
  nock('https://ru.hexlet.io')
    .get('/courses/500')
    .reply(500);

  nock('https://ru.hexlet.io')
    .get('/courses/access')
    .reply(200, expectFile);
  nock('https://ru.hexlet.io')
    .get('/courses/network')
    .replyWithError('Network Error');
});

describe('page loading test', () => {
  test('async page loading', async () => {
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
});

describe('statuses tests', () => {
  test.each([
    ['https://ru.hexlet.io/courses/404', 404],
    ['https://ru.hexlet.io/courses/500', 500],
  ])('test (%s)', async (src, expected) => {
    await expect(loadPage(src, outputPath))
      .rejects.toThrowError(`Request failed with status code ${expected}`);
  });
});

describe('not access and network error', () => {
  test('not access', async () => {
    const rootDirPath = '/sys';

    await expect(loadPage('https://ru.hexlet.io/courses/access', rootDirPath))
      .rejects.toThrow(/EACCES/);
  });

  test('network error', async () => {
    await expect(loadPage('https://ru.hexlet.io/courses/network', outputPath))
      .rejects.toThrowError('Network Error');
  });
});
