import Axios from 'axios';

const pageLoading = (path) => {
  Axios.get(path)
    .then((response) => response.data)
    .catch((err) => console.log(err));
};

export default pageLoading;
