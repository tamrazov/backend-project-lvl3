import getCurrentPath from './src/currentPath.js';
import { pageLoading, mkdir, writeFile, fetchResourses } from './src/utils.js';

export default (url, output) => {
  if (url) {
    const currentPath = getCurrentPath(url);
    pageLoading(url)
      .then((page) => mkdir(`${output}/__files`, page))
      .then((page) => mkdir(`${output}/__files/${currentPath}`, page))
      .then((page) => writeFile(`${output}/__files/${currentPath}/${currentPath}.html`, page))
      .then((page) => fetchResourses(page))
      .catch((err) => console.log(err));
  }
};
