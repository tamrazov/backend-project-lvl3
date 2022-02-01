import axios from 'axios';
import 'axios-debug-log';
import debug from 'debug';
import { exit } from 'process';

debug('booting %o', 'page-loader');

export default (path) => {
  debug(`fetch file from ${path}`);
  return axios.get(path)
    .then((response) => {
      debug(`success fetch file ${response.status}`);
      return response.data;
    })
    .catch((err) => {
      debug(`fetch error ${err}`);
      console.error(err);
      exit(2);
    });
};

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
