import fs from 'fs/promises';
import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import path from 'path';
import { downloadResource, slugifyUrl, extractResources } from './utils.js';

const log = debug('page-loader');

export default (url, output = process.cwd()) => {
  if (!url) {
    throw new Error('url is required');
  }

  log('fetch page from', url);
  log('output to', output);

  const pageUrl = new URL(url);
  const pageFileName = slugifyUrl(pageUrl);
  const resourcesDir = `${pageFileName}_files`;
  const resourcesDirPath = path.join(output, resourcesDir);
  const pageFilePath = path.join(output, `${pageFileName}.html`);

  return axios.get(url)
    .then(({ data }) => fs.access(resourcesDirPath, constants.W_OK)
      .catch(() => fs.mkdir(resourcesDirPath)
        .then(() => data)))
    .then((content) => {
      const { resources, html } = extractResources(content, resourcesDir, pageUrl.origin);

      log('save page file', pageFilePath);

      return fs.writeFile(pageFilePath, html)
        .then(() => resources);
    })
    .then((resources) => {
      const tasks = resources.map(({ resourceUrl, resourceFilePath }) => ({
        title: resourceFilePath,
        task: () => downloadResource(resourceUrl, path.join(output, resourceFilePath)),
      }));
      const listr = new Listr(tasks, { concurrent: true, exitOnError: false });

      return listr.run()
        .then(() => pageFilePath);
    });
};
