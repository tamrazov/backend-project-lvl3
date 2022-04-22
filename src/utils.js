import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import path from 'path';
import cheerio from 'cheerio';

debug('booting %o', 'page-loader');

const attrsTypesFromTag = {
  img: 'src',
  script: 'src',
  link: 'href',
};

export const getHost = (url) => {
  const { host } = new URL(url);

  return host;
};

export const getProtocol = (url) => {
  const { protocol } = new URL(url);

  return protocol;
};

export const fetchPage = (pathPage) => {
  debug(`fetch file from ${pathPage}`);
  return axios.get(pathPage)
    .then((response) => {
      debug(`success fetch file ${response.status}`);
      return response.data;
    })
    .catch((err) => {
      debug(`fetch error ${err}`);
      throw err;
    });
};

export const getCurrentPath = (str, ext = '') => {
  let string = str;
  if (string.charAt(0) === '/') {
    string = string.slice(1);
  }

  let curName;
  if (string.includes('://')) {
    curName = string.split('://')['1'];
  } else {
    curName = string;
  }
  const curResult = curName.replace(/([.\\/])/gi, '-');

  return `${curResult}${ext}`;
};

export const getCurrentResoursePath = (str, mainHost) => {
  let result = str;

  if (result.startsWith('/')) {
    result = `https://${mainHost}${result}`;
  }

  const { dir, name, ext } = path.parse(result);

  return getCurrentPath(`${dir}/${name}`, ext || '.html');
};

export const getDownloadPath = (str, mainHost, mainProtocol) => {
  let result = str;

  if (result.startsWith('/')) {
    result = `${mainProtocol}//${mainHost}${result}`;
  } else {
    const { pathname } = new URL(str);
    result = `${mainProtocol}//${mainHost}${pathname}`;
  }

  return result;
};

export const extractResourses = (html, outputPath, currentPath, mainHost, mainProtocol) => {
  const $ = cheerio.load(html);
  const images = $('img').toArray();
  const scripts = $('script').toArray();
  const links = $('link').toArray();
  const data = [...images, ...scripts, ...links].filter((el) => {
    const result = el.attribs[attrsTypesFromTag[el.name]];
    if (result.startsWith('/')) {
      return true;
    }

    const host = getHost(result);

    if (host !== mainHost) {
      return false;
    }

    return true;
  });

  const resourses = data
    .filter((el) => el.attribs[attrsTypesFromTag[el.name]])
    .map((el) => {
      const src = el.attribs[attrsTypesFromTag[el.name]];
      const curResoursePath = getCurrentResoursePath(
        el.attribs[attrsTypesFromTag[el.name]],
        mainHost,
      );
      const resoursePath = `${outputPath}/${curResoursePath}`;
      $(el).attr(attrsTypesFromTag[el.name], `${currentPath}_files/${curResoursePath}`);

      return {
        resPath: getDownloadPath(src, mainHost, mainProtocol),
        resName: resoursePath,
      };
    });

  return { resourses, html: $.html() };
};
