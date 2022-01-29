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

  await loadPage('https://ru.hexlet.io/courses', process.cwd());

  expect(page).toBe(expectFile);
});

test.skip('page loading with resources', async () => {
  // const asdf = fetchResourses(expectFile);
  // expect(expectFile).toBe(asdf);
});

test('error 4xx fetch page', async () => {
  nock('https://ru.hexlet.io')
    .get('/coursesssss')
    .reply(404);

  await expect(loadPage('https://ru.hexlet.io/coursesssss', process.cwd()))
    .rejects.toMatch('Sorry! Error from https://ru.hexlet.io/coursesssss, status request 404');
});

test('error 5xx fetch page', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(500);

  await expect(loadPage('https://ru.hexlet.io/courses', process.cwd()))
    .rejects.toMatch('Sorry! Error from https://ru.hexlet.io/courses, status request 500');
});

test('not connect test', async () => {

});

test('test not url', async () => {
  await expect(loadPage('', process.cwd()))
    .rejects;
});

test('test not access', () => {

});
