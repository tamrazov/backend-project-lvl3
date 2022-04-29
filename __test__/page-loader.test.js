import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import loadPage from '../src/index.js';

nock.disableNetConnect();

const pageBase = 'https://ru.hexlet.io';
const pageUrl = new URL('/courses', pageBase);
const server = nock(pageBase).persist();
const resources = [
  {
    fileSrc: '/assets/professions/nodejs.png',
    filePath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
  },
  {
    fileSrc: '/packs/js/runtime.js',
    filePath: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
  },
  {
    fileSrc: '/assets/application.css',
    filePath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
  },
  {
    fileSrc: '/courses',
    filePath: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
  },
];

const getFixturePath = (filename) => path.join('__fixtures__', filename);
const readFile = (filename) => fs.readFile(filename, 'utf-8');
const makeOutputDir = () => fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

describe('success page-loading work', () => {
  let outputPath;

  beforeAll(async () => {
    outputPath = await makeOutputDir();
    resources.forEach((el) => {
      server
        .get(el.fileSrc)
        .replyWithFile(200, getFixturePath(el.filePath));
    });

    await loadPage(pageUrl.toString(), outputPath);
  });

  test.each(resources)('resource loaded successfully $fileSrc', async ({ filePath }) => {
    const actual = await readFile(path.join(outputPath, filePath));
    const expected = await readFile(getFixturePath(filePath));

    expect(actual).toBe(expected);
  });

  test('main page loaded successfully', async () => {
    const pageFileName = 'ru-hexlet-io-courses.html';
    const actual = await readFile(path.join(outputPath, pageFileName));
    const expected = await readFile(getFixturePath(pageFileName));

    expect(actual).toBe(expected);
  });
});

describe('errors cases tests', () => {
  let outputPath;

  beforeAll(async () => {
    outputPath = await makeOutputDir();
  });

  test.each([404, 500])('test (%s)', async (status) => {
    const url = new URL(`/${status}`, pageBase);

    server
      .get(url.pathname)
      .reply(status);

    await expect(loadPage(url.toString(), outputPath))
      .rejects.toThrowError(`Request failed with status code ${status}`);
  });
});

describe('not access error and network error tests', () => {
  test('not access', async () => {
    const rootDirPath = '/sys';

    await expect(loadPage(pageUrl.toString(), rootDirPath))
      .rejects.toThrow(/EACCES/);
  });

  test('network error', async () => {
    const outputPath = await makeOutputDir();
    const url = new URL('/network', pageBase);

    server
      .get(url.pathname)
      .replyWithError('Network Error');

    await expect(loadPage(url.toString(), outputPath))
      .rejects.toThrowError('Network Error');
  });
});
