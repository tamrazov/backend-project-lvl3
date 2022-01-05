import nock from 'nock';
import fs from 'fs';
import pageLoading from '../src/utils.js';

nock.disableNetConnect();
let expectFile;

beforeEach(async () => {
  expectFile = await fs.readFile('./__fixtures__/ru-hexlet-io-courses.html', 'utf-8', (err) => console.log(err));
});

test('first', async () => {
  nock('https://ru.hexlet.io/')
    .get('courses')
    .reply(200);

  const page = await pageLoading('https://ru.hexlet.io/courses');

  expect(page).toBe(expectFile);
});
