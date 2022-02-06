import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';
import debug from 'debug';
import Listr from 'listr';
import { constants } from 'fs';
import getCurrentPath from './src/currentPath.js';
import fetchPage from './src/utils.js';

debug('booting %o', 'page-loader');

const extractResourses = (html, outputPath) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  // const links = $('link').toArray();
  const scripts = $('script').toArray();
  const data = [...images, ...scripts];

  const resourses = data.filter((el) => el.attribs.src).map((el) => {
    const { src } = el.attribs;
    const resoursePath = `${outputPath}/${getCurrentPath(src)}`;
    $(el).attr('src', src);

    return {
      path: src,
      name: resoursePath,
    };
  });

  return { resourses, html: $.html() };
};

export default (url, output) => {
  const currentPath = getCurrentPath(url);
  console.log(currentPath, output)

  return fetchPage(url)
    .then((page) => fs.access(`${output}/${currentPath}`, constants.R_OK)
      .then(() => fs.mkdir(`${output}/${currentPath}_files`).then(() => page))
      .catch(() => fs.mkdir(`${output}/${currentPath}_files`, { recursive: true })
        .then(() => page)))
    .then((page) => {
      const { resourses, html } = extractResourses(page, `${output}/${currentPath}_files`);
      const resoursesDownload = resourses.filter((_, i) => i < 5).map(({ path, name }) => ({
        title: name,
        task: () => axios({
          method: 'get',
          url: path,
          responseType: 'stream',
        })
          .then((response) => {
            debug(`success fetch resource ${response.status}`);
            return response.data.pipe(fs.createWriteStream(name));
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
