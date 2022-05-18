import fs from 'fs/promises';
import axios from 'axios';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import path from 'path';
import { fetchPage, getCurrentPath, extractResourses } from './utils.js';

debug('booting %o', 'page-loader');

export default (url, output = process.cwd()) => {
  if (!url) {
    throw new Error('Error');
  }

  const { dir, name } = path.parse(url);
  const currentPath = getCurrentPath(path.join(dir, name));
  const pathForDir = path.join(output, `${currentPath}_files`);
  const pathMainFile = path.join(output, `${currentPath}.html`);

  return fetchPage(url)
    .then((page) => fs.access(pathForDir, constants.W_OK)
      .catch(() => fs.mkdir(pathForDir)
        .then(() => page)))
    .then((page) => {
      const { origin } = new URL(url);
      const { resourses, html } = extractResourses(page, pathForDir, currentPath, origin);
      const resoursesDownloadAndSave = resourses.map(({ resPath, resName }) => ({
        title: resName,
        task: () => axios({
          method: 'get',
          url: resPath,
          responseType: 'arraybuffer',
        })
          .then(({ data, status }) => {
            debug(`success fetch resource ${status}`);
            return fs.writeFile(resName, data);
          })
          .catch((err) => {
            debug(`fetch error ${err}`);
            throw err;
          }),
      }));
      const tasks = new Listr(resoursesDownloadAndSave, { concurrent: true, exitOnError: false });

      return tasks.run()
        .then(() => fs.writeFile(pathMainFile, html))
        .then(() => pathMainFile);
    });
};
