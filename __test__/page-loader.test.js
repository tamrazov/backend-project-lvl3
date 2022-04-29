import nock from 'nock';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import loadPage from '../src/index.js';

nock.disableNetConnect();

let outputPath;
const rootPath = 'https://ru.hexlet.io';
const nockInstance = nock(rootPath).persist();
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

describe('success page resourses loading', () => {
  beforeAll(async () => {
    outputPath = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    resources.forEach((el) => {
      nockInstance
        .get(el.fileSrc)
        .replyWithFile(200, getFixturePath(el.filePath));
    });

    await loadPage('https://ru.hexlet.io/courses', outputPath);
  });

  test.each(resources)('async page loading %o', async (el) => {
    const expectFile = await readFile(path.join(outputPath, el.filePath));
    const actualFile = await readFile(getFixturePath(el.filePath));

    expect(expectFile).toBe(actualFile);
  });

  test('async main page loading', async () => {
    const expectFile = await readFile(path.join(outputPath, 'ru-hexlet-io-courses.html'));
    const actualFile = await readFile(getFixturePath('ru-hexlet-io-courses.html'));

    expect(expectFile).toBe(actualFile);
  });
});

describe('errors cases tests', () => {
  const statuses = [404, 500];

  test.each(statuses)('test (%s)', async (status) => {
    nockInstance
      .get(`/courses/${status}`)
      .reply(status);

    const url = new URL(`/courses/${status}`, rootPath);

    await expect(loadPage(url.toString(), outputPath))
      .rejects.toThrowError(`Request failed with status code ${status}`);
  });
});

describe('not access error and network error tests', () => {
  beforeEach(() => {
    nockInstance
      .get('/courses/access')
      .replyWithFile(200, getFixturePath('ru-hexlet-io-courses.html'));
    nockInstance
      .get('/courses/network')
      .replyWithError('Network Error');
  });

  test('not access', async () => {
    const rootDirPath = '/sys';
    const url = new URL('/courses/access', rootPath);

    await expect(loadPage(url.toString(), rootDirPath))
      .rejects.toThrow(/EACCES/);
  });

  test('network error', async () => {
    const url = new URL('/courses/network', rootPath);

    await expect(loadPage(url.toString(), outputPath))
      .rejects.toThrowError('Network Error');
  });
});
