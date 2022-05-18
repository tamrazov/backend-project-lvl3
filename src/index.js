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
  const currentPath = getCurrentPath(`${dir}/${name}`);

  return fetchPage(url)
    .then((page) => fs.access(`${output}/${currentPath}_files`, constants.W_OK)
      .catch(() => fs.mkdir(`${output}/${currentPath}_files`)
        .then(() => page)))
    .then((page) => {
      const { origin } = new URL(url);
      const { resourses, html } = extractResourses(page, `${output}/${currentPath}_files`, currentPath, origin);
      const resoursesDownload = resourses.map(({ resPath, resName }) => ({
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
      const tasks = new Listr(resoursesDownload, { concurrent: true, exitOnError: false });

      return tasks.run()
        .then(() => fs.writeFile(`${output}/${currentPath}.html`, html))
        .then(() => `${output}/${currentPath}.html`);
    });
};
