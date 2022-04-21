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
const rootPath = 'https://ru.hexlet.io';

const readFixtureFile = async (src) => fs.readFile(`./__fixtures__/${src}`, 'utf-8');

describe('page loading test', () => {
  beforeEach(async () => {
    outputPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    resivedFile = await readFixtureFile('ru-hexlet-io-courses.html');
    expectFile = await readFixtureFile('ru-hexlet-io-courses-expected.html');
    resourceFilePng = await readFixtureFile('ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png');
    resourceFileJS = await readFixtureFile('ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js');
    resourceFileCss = await readFixtureFile('ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css');
    resourceFileHTML = await readFixtureFile('ru-hexlet-io-courses_file.html');
  
    nock(rootPath)
      .get('/courses')
      .reply(200, resivedFile);
    nock(rootPath)
      .get('/assets/professions/nodejs.png')
      .reply(200, resourceFilePng);
    nock(rootPath)
      .get('/packs/js/runtime.js')
      .reply(200, resourceFileJS);
    nock(rootPath)
      .get('/assets/application.css')
      .reply(200, resourceFileCss);
    nock(rootPath)
      .get('/courses')
      .reply(200, resourceFileCss);
  });

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
  beforeEach(() => {
    nock(rootPath)
      .get('/courses/404')
      .reply(404);
    nock(rootPath)
      .get('/courses/500')
      .reply(500);
  });

  test.each([404, 500])('test (%s)', async (status) => {
    await expect(loadPage(`https://ru.hexlet.io/courses/${status}`, outputPath))
      .rejects.toThrowError(`Request failed with status code ${status}`);
  });
});

describe('not access and network error', () => {
  beforeEach(() => {
    nock(rootPath)
      .get('/courses/access')
      .reply(200, expectFile);
    nock(rootPath)
      .get('/courses/network')
      .replyWithError('Network Error');
  });

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
