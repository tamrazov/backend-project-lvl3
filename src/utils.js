import fs from 'fs/promises';
import { constants } from 'fs';
import axios from 'axios';

export const pageLoading = (path) => axios.get(path)
  .then((response) => response.data)
  .catch((err) => console.log(err));

export const mkdir = (path, data) => fs.access(path, constants.R_OK)
  .then(() => Promise.resolve(data))
  .catch(() => fs.mkdir(path, (err) => {
    if (!err) {
      return new Promise((res) => {
        res(data);
      });
    }

    return Promise.reject(new Error('error!'));
  }));
