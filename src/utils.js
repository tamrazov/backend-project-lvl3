import axios from 'axios';

const pageLoading = (path) => {
  return axios.get(path)
    .then((response) => response.data)
    .catch((err) => console.log(err));
};

export default pageLoading;
