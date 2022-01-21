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
        const scripts = $('script');
        const resourses = [images[0], scripts[0]];

        if (scripts.length) {
          scripts.each((i, el) => {
            if (i > 2) {
              return;
            }
            if (el.attribs.src) {
              const name = `${output}/${currentPath}_files/${el.attribs.src}`;
              console.log(el.attribs.src)
              fetchResourse(el.attribs.src, name)
                .then(() => {
                  // fs.readFile(`${output}/${currentPath}.html`)
                  //   .then((file) => {
                  //     const $ = cheerio.load(file);
                  //     $('img').attr('src', name);
                  //     fs.writeFile();
                  //   })
                });
            }
          });
        }
      })
      .catch((err) => console.log(err));
  }
};
