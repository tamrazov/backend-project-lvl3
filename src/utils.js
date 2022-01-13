import fs from 'fs/promises';
import { constants } from 'fs';
import axios from 'axios';
import cheerio from 'cheerio';

export const pageLoading = (path) => axios.get(path)
  .then((response) => response.data)
  .catch((err) => console.log(err));

export const mkdir = (path, data) => fs.access(path, constants.R_OK)
  .then(() => Promise.resolve(data))
  .catch(() => fs.mkdir(path))
  .then(() => new Promise((res) => res(data)))
  .catch(() => Promise.reject(new Error('error!')));

export const writeFile = (path, data) => {
  return fs.writeFile(path, data)
    .then(() => Promise.resolve(data))
    .catch((err) => Promise.reject(new Error(err)));
};

export const fetchResourses = (data) => {
  const $ = cheerio.load(data);

  $('img').each((i, el) => {
    console.log(el.attribs.src);
  })
};
