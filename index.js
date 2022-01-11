import fs from 'fs/promises';
import getCurrentPath from './src/currentPath.js';
import pageLoading from './src/utils.js';

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    pageLoading(url)
      .then((page) => {
        fs.mkdir(`${output}/__files`)
          .then(() => {
            fs.mkdir(`${output}/__files/${currentPath}`)
              .then(() => {
                fs.writeFile(`${output}/__files/${currentPath}/${currentPath}.html`, page);
              });
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
