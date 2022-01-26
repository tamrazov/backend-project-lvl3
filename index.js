import fs from 'fs/promises';
import { constants } from 'fs';
import { parse } from 'path';
import cheerio from 'cheerio';
import getCurrentPath from './src/currentPath.js';
import { fetchPage, fetchResourse } from './src/utils.js';

const extractResourses = (html, outputPath) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  // const links = $('link').toArray();
  const scripts = $('script').toArray();
  const data = [...images, ...scripts];

  const resourses = data.map((el, i) => {
    if (el.attribs.src && el.attribs.src.charAt(0) === '/') {
      const src = el.attribs.src;
      console.log(src)
      // const resoursePath = `${outputPath}/${getCurrentPath(src)}`;
      $(el).attr('src', src);

      return {
        path: src,
        name: src,
      };
    }

    return;
  }).filter((el) => el.path);

  return { resourses, html: $.html() };
}

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    fetchPage(url)
      // .then((page) => fs.writeFile(`${output}/${currentPath}.html`, page)
        .then((page) => fs.access(`${output}/${currentPath}`, constants.R_OK)
          .then(() => fs.mkdir(`${output}/${currentPath}_files`).then(() => page))
          .catch(() => fs.mkdir(`${output}/${currentPath}_files`, { recursive: true })
            .then(() => page),
          ))
      .then((page) => {
        const { resourses, html } = extractResourses(page, `${output}/${currentPath}_files`);
        console.log(resourses)
        // Promise.all(resourses.map(({path, name}, i) => {
        //   return fetchResourse(path, name);
        // }))
        //   .then(() => fs.writeFile(`${output}/${currentPath}.html`, html))
      })
      .catch((err) => console.log(err));
  }
};
