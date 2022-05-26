import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import path from 'path';
import cheerio from 'cheerio';
import fs from 'fs/promises';

const log = debug('page-loader');

const tagsAttributes = {
  img: 'src',
  script: 'src',
  link: 'href',
};

export const fetchPage = (url) => {
  log('fetch page from', url);

  return axios.get(url)
    .then((response) => response.data)
    .catch((err) => {
      throw err;
    });
};

export const fetchTask = (url, filePath, output) => axios({
  method: 'get',
  url,
  responseType: 'arraybuffer',
})
  .then(({ data }) => {
    log('success fetch resource', filePath);
    return fs.writeFile(path.join(output, filePath), data);
  })
  .catch((err) => {
    log(`fetch error ${err}`);
    throw err;
  });

export const constructPath = (url, ext = '') => {
  const { host, pathname } = new URL(url);

  const fileName = `${host}${pathname}`.replace(/\W/gi, '-');

  return `${fileName}${ext}`;
};

export const constructResoursesPath = (url) => {
  const { dir, name, ext } = path.parse(url.href);

  return constructPath(`${dir}/${name}`, ext || '.html');
};

export const extractResourses = (html, resourcesDir, pageOrigin) => {
  const $ = cheerio.load(html);
  const resourses = Object.entries(tagsAttributes)
    .flatMap(([tagName, attr]) => $(tagName).toArray()
      .map((el) => $(el))
      .map(($element) => ({
        $element,
        url: new URL($element.attr(attr), pageOrigin),
        attr,
      })))
    .filter(({ url }) => url.origin === pageOrigin)
    .map(({ $element, url, attr }) => {
      const resourceFileName = constructResoursesPath(url);
      const filePath = path.join(resourcesDir, resourceFileName);

      $element.attr(attr, filePath);

      return {
        url: url.toString(),
        filePath,
      };
    });

  return { resourses, html: $.html() };
};
