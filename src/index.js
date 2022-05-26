import fs from 'fs/promises';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import path from 'path';
import {
  fetchPage, fetchTask, constructPath, extractResourses,
} from './utils.js';

const log = debug('page-loader');

export default (url, output = process.cwd()) => {
  if (!url) {
    throw new Error('Not url!');
  }

  log('url and output', url, output);
  const { dir, name } = path.parse(url);
  const pageFileName = constructPath(path.join(dir, name));
  const resourcesDir = `${pageFileName}_files`;
  const resourcesDirPath = path.join(output, resourcesDir);
  const pageFilePath = path.join(output, `${pageFileName}.html`);

  return fetchPage(url)
    .then((page) => fs.access(resourcesDirPath, constants.W_OK)
      .catch(() => fs.mkdir(resourcesDirPath)
        .then(() => page)))
    .then((page) => {
      const { origin } = new URL(url);
      const { resourses, html } = extractResourses(page, resourcesDir, origin);
      const tasksDownloadAndSave = resourses.map(({ url: resourcesUrl, filePath }) => ({
        title: filePath,
        task: () => fetchTask(resourcesUrl, filePath, output),
      }));
      const listr = new Listr(tasksDownloadAndSave, { concurrent: true, exitOnError: false });

      log('saving main page file', pageFilePath);
      return listr.run()
        .then(() => fs.writeFile(pageFilePath, html))
        .then(() => pageFilePath);
    });
};
