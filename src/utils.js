import axios from 'axios';
import fs from 'fs';
import 'axios-debug-log';
import debug from 'debug';

debug('booting %o', 'page-loader');

export const fetchPage = (path) => {
  debug(`fetch file from ${path}`);
  return axios.get(path)
    .then((response) => {
      debug(`success fetch file ${response.status}`);
      return response.data;
    })
    .catch((err) => {
      debug(`fetch error ${err}`);
      return Promise.reject(err);
    });
}

export const fetchResourse = (path, name) => {
  debug(`fetch resource from ${path}`);

  return axios({
    method: 'get',
    url: path,
    responseType: 'stream',
  })
    .then((response) => {
      debug(`success fetch resource ${response.status}`);
      return response.data.pipe(fs.createWriteStream(name))
    });
};
