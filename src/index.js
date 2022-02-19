import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import path from 'path';
import { fetchPage, getCurrentPath } from './utils.js';

debug('booting %o', 'page-loader');

const extractResourses = (html, outputPath, currentPath) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  const scripts = $('script').toArray();
  const data = [...images, ...scripts];

  const resourses = data
    .filter((el) => el.attribs.src && el.attribs.src.startsWith('/'))
    .map((el) => {
      const src = el.attribs.src
      const { dir, name, ext } = path.parse(src);
      const resoursePath = `${outputPath}/${currentPath}-${getCurrentPath(`${dir}/${name}`, ext)}`;
      $(el).attr('src', src);

      return {
        path: src,
        name: resoursePath,
      };
    });

  return { resourses, html: $.html() };
};

export default (url, output) => {
  const { dir, name } = path.parse(url);
  const currentPath = getCurrentPath(`${dir}/${name}`);
  console.log(dir, name, currentPath);

  return fetchPage(url)
    .then((page) => fs.access(`${output}/${currentPath}`, constants.R_OK)
      .then(() => fs.mkdir(`${output}/${currentPath}_files`).then(() => page))
      .catch(() => fs.mkdir(`${output}/${currentPath}_files`, { recursive: true })
        .then(() => page)))
    .then((page) => {
      const { resourses, html } = extractResourses(page, `${output}/${currentPath}_files/`, currentPath);
      const resoursesDownload = resourses.map(({ path, name }) => ({
        title: name,
        task: () => axios({
          method: 'get',
          url: `${dir}${path}`,
          responseType: 'arraybuffer',
        })
          .then(({data, status}) => {
            debug(`success fetch resource ${status}`);
            return fs.writeFile(name, data);
          })
          .catch((err) => {
            debug(`fetch error ${err}`);
            console.error(err);
          }),
      }));
      const tasks = new Listr(resoursesDownload, { concurrent: true, exitOnError: false });

      return tasks.run()
        .then(() => fs.writeFile(`${output}/${currentPath}.html`, html));
      // exit(0);
    })
};
