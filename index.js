import fs from 'fs/promises';
import { constants } from 'fs';
import cheerio from 'cheerio';
// import debug from 'axios-debug-log';
import getCurrentPath from './src/currentPath.js';
import { fetchPage, fetchResourse } from './src/utils.js';
import debug from 'debug';

debug('booting %o', 'page-loader');
debug('sksdjfksdjfskdjf hello!')

const extractResourses = (html, outputPath) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  // const links = $('link').toArray();
  const scripts = $('script').toArray();
  const data = [...images, ...scripts];

  const resourses = data.map((el, i) => {
    if (el.attribs.src) {
      const src = el.attribs.src;
      const resoursePath = `${outputPath}/${getCurrentPath(src)}`;
      $(el).attr('src', src);

      return {
        path: src,
        name: resoursePath,
      };
    }

    return;
  }).filter((el) => el);

  return {resourses, html: $.html()};
}

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    return fetchPage(url)
      .then((page) => fs.access(`${output}/${currentPath}`, constants.R_OK)
        .then(() => fs.mkdir(`${output}/${currentPath}_files`).then(() => page))
        .catch(() => fs.mkdir(`${output}/${currentPath}_files`, { recursive: true })
          .then(() => page),
        ))
      .then((page) => {
        const { resourses, html } = extractResourses(page, `${output}/${currentPath}_files`);
        Promise.allSettled(resourses.map(({path, name}, i) => {
          return fetchResourse(path, name);
        }))
          .then(() => fs.writeFile(`${output}/${currentPath}.html`, html))
      })
      .catch((err) => {
        console.error(err);
      });
  }
};
