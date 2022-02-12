import nock from 'nock';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// import { fetchPage } from '../src/utils.js';
import loadPage from '../index.js';

nock.disableNetConnect();
let expectFile;
let outputPath = 'C:\\Users\\alexandr.tamrazov\\OneDrive - Accenture\\Desktop\\projects';

beforeEach(async () => {
  expectFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf-8');
});

test('async page loading', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, expectFile);

  await loadPage('https://ru.hexlet.io/courses', outputPath);
  const file = await fs.readFile(path.join(
    outputPath,
    'ru-hexlet-io-courses.html'
  ), 'utf-8');

  expect(file).toBe(expectFile);
});

// test.skip('page loading with resources', async () => {
//   // const asdf = fetchResourses(expectFile);
//   // expect(expectFile).toBe(asdf);
// });

// test('error 4xx fetch page', async () => {
//   nock('https://ru.hexlet.io')
//     .get('/coursesssss')
//     .reply(404);

//   await expect(loadPage('https://ru.hexlet.io/coursesssss', process.cwd()))
//     .rejects;
// });

// test('error 5xx fetch page', async () => {
//   nock('https://ru.hexlet.io')
//     .get('/courses')
//     .reply(500);

//   await expect(loadPage('https://ru.hexlet.io/courses', process.cwd()))
//     .rejects.toBe('');
// });

// test('not connect test', async () => {

// });

// test.skip('not url', async () => {
//   await expect(loadPage('', process.cwd()))
//     .rejects.toMatch('kajdsak');
// });

// test.skip('test not access', () => {
//   // c:Perflogs
// });
