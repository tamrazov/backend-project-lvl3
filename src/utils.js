import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import path from 'path';
import cheerio from 'cheerio';

debug('booting %o', 'page-loader');

const tagsAttributes = {
  img: 'src',
  script: 'src',
  link: 'href',
};

export const fetchPage = (url) => {
  debug('fetch file from', url);
  return axios.get(url)
    .then((response) => {
      debug('success fetch file', response.status);
      return response.data;
    })
    .catch((err) => {
      debug('fetch error', err);
      throw err;
    });
};

export const getCurrentPath = (str, ext = '') => {
  const { host, pathname } = new URL(str);

  const curResult = `${host}${pathname}`.replace(/([.\\/])/gi, '-');

  return `${curResult}${ext}`;
};

export const getCurrentResoursePath = (url) => {
  const { dir, name, ext } = path.parse(url);

  return getCurrentPath(`${dir}/${name}`, ext || '.html');
};

export const extractResourses = (html, outputPath, currentPath, origin) => {
  const $ = cheerio.load(html);
  const data = Object.keys(tagsAttributes).flatMap((el) => $(el).toArray());

  const resourses = data
    .filter((el) => {
      // determine the locality of the paths
      const url = new URL(el.attribs[tagsAttributes[el.name]], origin);

      if (url.origin === origin) {
        return true;
      }

      return false;
    })
    .map((el) => {
      const src = el.attribs[tagsAttributes[el.name]];
      const resPath = new URL(src, origin).toString();
      const curResoursePath = getCurrentResoursePath(resPath);
      const resoursePath = path.join(outputPath, curResoursePath);
      $(el).attr(tagsAttributes[el.name], path.join(`${currentPath}_files`, curResoursePath));

      return {
        resPath,
        resName: resoursePath,
      };
    });

  return { resourses, html: $.html() };
};
