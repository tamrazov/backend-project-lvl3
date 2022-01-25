import nock from 'nock';
import fs from 'fs/promises';
import { fetchPage } from '../src/utils.js';
import loadPage from '../index.js';

nock.disableNetConnect();
let expectFile;

beforeEach(async () => {
  expectFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf-8');
});

test('async page loading', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectFile);

  const page = await loadPage('https://ru.hexlet.io/courses', process.cwd());

  expect(page).toBe(expectFile);
});

test.skip('page loading with resources', async () => {
  // const asdf = fetchResourses(expectFile);
  // expect(expectFile).toBe(asdf);
});
