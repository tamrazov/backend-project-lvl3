import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import path from 'path';
import { tagTypes } from './constants';
import {
  fetchPage, getCurrentPath, getCurrentResoursePath,
  getHost, getDownloadPath,
} from './utils.js';

debug('booting %o', 'page-loader');

const extractResourses = (html, outputPath, currentPath, mainHost) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  const scripts = $('script').toArray();
  const links = $('link').toArray();
  const data = [...images, ...scripts, ...links].filter((el) => {
    const result = el.attribs[tagTypes[el.name]];
    if (result.startsWith('/')) {
      return true;
    }

    const host = getHost(result);

    if (host !== mainHost) {
      return false;
    }

    return true;
  });

  const resourses = data
    .filter((el) => el.attribs[tagTypes[el.name]])
    .map((el) => {
      const src = el.attribs[tagTypes[el.name]];
      const curResoursePath = getCurrentResoursePath(el.attribs[tagTypes[el.name]], mainHost);
      const resoursePath = `${outputPath}/${curResoursePath}`;
      $(el).attr('src', curResoursePath);

      return {
        resPath: getDownloadPath(src, mainHost),
        resName: resoursePath,
      };
    });

  return { resourses, html: $.html() };
};

export default (url, output) => {
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
      const { host } = new URL(url);
      const { resourses, html } = extractResourses(page, `${output}/${currentPath}_files`, currentPath, host);
      const resoursesDownload = resourses.map(({ resPath, resName }) => ({
        title: resName,
        task: () => axios({
          method: 'get',
          url: `${dir}${resPath}`,
          responseType: 'arraybuffer',
        })
          .then(({ data, status }) => {
            debug(`success fetch resource ${status}`);
            return fs.writeFile(resName, data);
          })
          .catch((err) => {
            debug(`fetch error ${err}`);
          }),
      }));
      const tasks = new Listr(resoursesDownload, { concurrent: true, exitOnError: false });

      return tasks.run()
        .then(() => fs.writeFile(`${output}/${currentPath}.html`, html));
      // exit(0);
    });
};
