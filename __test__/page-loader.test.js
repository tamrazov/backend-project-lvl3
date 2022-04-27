import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import loadPage from '../src/index.js';

nock.disableNetConnect();

let expectFile;
let outputPath;
const rootPath = 'https://ru.hexlet.io';
const getFixturePath = (filename) => path.join('__fixtures__', filename);
const readFile = (filename) => fs.readFile(filename, 'utf-8');

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

describe('success page loading', () => {
  beforeAll(async () => {
    outputPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    resources.forEach((el) => {
      nock(rootPath)
        .persist()
        .get(el.fileSrc)
        .replyWithFile(200, getFixturePath(el.filePath));
    });
    await loadPage('https://ru.hexlet.io/courses', outputPath);
  });

  test.each(resources)('async page loading %o', async (el) => {
    expect(
      await readFile(path.join(
        outputPath,
        el.filePath,
      )),
    ).toBe(await readFile(getFixturePath(el.filePath)));
  });
});

describe('errors cases tests', () => {
  const statuses = [404, 500];
  beforeEach(() => {
    statuses.forEach((status) => nock(rootPath).get(`/courses/${status}`).reply(status));
  });

  test.each(statuses)('test (%s)', async (status) => {
    await expect(loadPage(`${rootPath}/courses/${status}`, outputPath))
      .rejects.toThrowError(`Request failed with status code ${status}`);
  });
});

describe('not access error and network error tests', () => {
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

    await expect(loadPage(`${rootPath}/courses/access`, rootDirPath))
      .rejects.toThrow(/EACCES/);
  });

  test('network error', async () => {
    await expect(loadPage(`${rootPath}/courses/network`, outputPath))
      .rejects.toThrowError('Network Error');
  });
});
