import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';

debug('booting %o', 'page-loader');

export const fetchPage = (path) => {
  console.log(path, 'path path')
  debug(`fetch file from ${path}`);
  return axios.get(path)
    .then((response) => {
      debug(`success fetch file ${response.status}`);
      return response.data;
    })
    .catch((err) => {
      debug(`fetch error ${err}`);
      throw err;
    });
};

export const getCurrentPath = (string, ext = '') => {
  if (string.charAt(0) === '/') {
    string = string.slice(1)
  }

  let curName;
  if (string.includes('://')) {
    curName = string.split('://')['1'];
  } else {
    curName = string;
  }
  const curResult = curName.replace(/([.\\\/])/gi, '-');

  return `${curResult}${ext}`;
}

// export const fetchResourse = (path, name) => {
//   debug(`fetch resource from ${path}`);

//   return axios({
//     method: 'get',
//     url: path,
//     responseType: 'stream',
//   })
//     .then((response) => {
//       // debug(`success fetch resource ${response.status}`);
//       // return response.data.pipe(fs.createWriteStream(name))
//     })
//     .catch(() => {
//       // debug(`fetch error ${err}`);
//       // console.error(err);
//       // exit(1);
//     });
// };
