import fs from 'fs/promises';
import { constants } from 'fs';
import { parse } from 'path';
import cheerio from 'cheerio';
import getCurrentPath from './src/currentPath.js';
import { fetchPage, fetchResourse } from './src/utils.js';

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    fetchPage(url)
      .then((page) => fs.writeFile(`${output}/${currentPath}.html`, page)
        .then(() => fs.access(`${output}/${currentPath}`, constants.R_OK)
          .then(() => fs.mkdir(`${output}/${currentPath}_files`).then(() => page))
          .catch(() => fs.mkdir(`${output}/${currentPath}_files`, { recursive: true })
            .then(() => page),
          )))
      .then((page) => {
        const $ = cheerio.load(page);
        const images = $('img');
        console.log(images.length)

        if (images.length) {
          // images.each((i, el) => {
          //   console.log(el.attribs.src)
          //   const name = `${output}/${currentPath}_files/sad${i}.jpg`;
          //   fetchResourse(el.attribs.src, name)
          //     .then(() => {
          //       console.log('done');
          //     });
          // });
        }
      })
      .catch((err) => console.log(err));
  }
};
