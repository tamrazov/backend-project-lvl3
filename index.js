import fs from 'fs/promises';
import { constants } from 'fs';
import cheerio from 'cheerio';
import getCurrentPath from './src/currentPath.js';
import { fetchPage, fetchResourse } from './src/utils.js';

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    // fetchPage(url)
    fs.readFile(`./__fixtures__/ru-hexlet-io-courses.html`)
      .then((page) => fs.writeFile(`${output}/${currentPath}.html`, page)
        .then(() => fs.access(`${output}/${currentPath}`, constants.R_OK)
          .then(() => fs.mkdir(`${output}/${currentPath}_files`).then(() => page))
          .catch(() => fs.mkdir(`${output}/${currentPath}_files`, { recursive: true })
            .then(() => page),
          )))
      .then((page) => {
        const $ = cheerio.load(page);
        const images = $('img');

        if (images.length) {
          images.each((i, el) => {
            const name = `${output}/${currentPath}_files/ru-hexlet-io-courses.jpg`;
            console.log(name)
            fetchResourse(el.attribs.src, name)
              .then(() => {
                console.log('done');
              });
          });
        }
      })
      .catch((err) => console.log(err));
  }
};
