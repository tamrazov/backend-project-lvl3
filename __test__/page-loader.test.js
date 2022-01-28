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

test('error 404 fetch page', async () => {
  nock('https://ru.hexlet.io')
    .get('/coursesssss')
    .reply(404, 'Sorry! Error from https://ru.hexlet.io/sakdlsad, status request 405');

  expect(loadPage('https://ru.hexlet.io/coursesssss', process.cwd()))
    .rejects.toMatch('Sorry! Error from https://ru.hexlet.io/sakdlsad, status request 404');
});
