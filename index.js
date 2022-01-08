import fs from 'fs';
import getCurrentPath from './src/currentPath.js';
import pageLoading from './src/utils.js';

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    pageLoading(url)
      .then((page) => {
        fs.mkdir(`${output}/__files`, (err) => {
          if (err) {
            return;
          }
        });
        fs.mkdir(`${output}/__files/${currentPath}`, (err) => {
          if (err) {
            return;
          }
        });
        fs.writeFile(`${output}/__files/${currentPath}/${currentPath}.html`, page, (err) => {
          if (err) {
            console.log(err);
          }
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }
};
