import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import path from 'path';
import { fetchPage, getCurrentPath } from './utils.js';

debug('booting %o', 'page-loader');

const extractResourses = (html, outputPath, currentPath, mainHost) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  const scripts = $('script').toArray();
  const data = [...images, ...scripts];

  const resourses = data
    .filter((el) => {
      const { src } = el.attribs;
      if (!src) {
        return false;
      }

      if (src.startsWith('/')) {
        return true;
      }
      const { host } = new URL(src);

      return src && host === mainHost;
    })
    .map((el) => {
      const { src } = el.attribs;
      const { dir, name, ext } = path.parse(src);
      const resoursePath = `${outputPath}/${currentPath}-${getCurrentPath(`${dir}/${name}`, ext)}`;
      $(el).attr('src', src);

      return {
        resPath: src,
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
