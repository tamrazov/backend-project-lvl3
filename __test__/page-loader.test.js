import nock from 'nock';
import fs from 'fs/promises';
import { fetchPage } from '../src/utils.js';

nock.disableNetConnect();
let expectFile;

beforeEach(async () => {
  expectFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf-8');
});

test('async page loading', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectFile);

  const page = await fetchPage('https://ru.hexlet.io/courses');

  expect(page).toBe(expectFile);
});

test('page loading with resources', async () => {
  // const asdf = fetchResourses(expectFile);
  // expect(expectFile).toBe(asdf);
});
