import axios from 'axios';
import fs from 'fs';

export const fetchPage = (path) => axios.get(path)
  .then((response) => response.data)
  .catch((err) => console.log(err));

export const fetchResourse = (path, name) => axios({
  method: 'get',
  url: path,
  responseType: 'stream',
})
  .then((response) => response.data.pipe(fs.createWriteStream(name)));
