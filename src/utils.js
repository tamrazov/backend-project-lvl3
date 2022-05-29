import axios from 'axios';
import 'axios-debug-log';
import path from 'path';
import cheerio from 'cheerio';
import fs from 'fs/promises';

const tagsAttributes = {
  img: 'src',
  script: 'src',
  link: 'href',
};

export const downloadResource = (url, filePath) => axios({
  method: 'get',
  url,
  responseType: 'arraybuffer',
})
  .then(({ data }) => fs.writeFile(filePath, data));

export const slugifyUrl = ({ hostname, pathname }) => `${hostname}${pathname}`.replace(/\W/gi, '-');

export const slugifyResourseUrl = (url) => {
  const { dir, name, ext } = path.parse(url.pathname);
  const fileExtension = ext || '.html';
  const filePath = path.join(dir, name);
  const fileName = slugifyUrl(new URL(filePath, url.origin));

  return `${fileName}${fileExtension}`;
};

export const extractResources = (html, resourcesDir, pageOrigin) => {
  const $ = cheerio.load(html);
  const resources = Object.entries(tagsAttributes)
    .flatMap(([tagName, attr]) => $(tagName).toArray()
      .map((el) => $(el))
      .map(($element) => ({
        $element,
        url: new URL($element.attr(attr), pageOrigin),
        attr,
      })))
    .filter(({ url }) => url.origin === pageOrigin)
    .map(({ $element, url, attr }) => {
      const resourceFileName = slugifyResourseUrl(url);
      const resourceFilePath = path.join(resourcesDir, resourceFileName);

      $element.attr(attr, resourceFilePath);

      return {
        resourceUrl: url.toString(),
        resourceFilePath,
      };
    });

  return { resources, html: $.html() };
};
