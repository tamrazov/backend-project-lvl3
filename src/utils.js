import Axios from 'axios';

export const fetch = async (path) => {
  const response = await Axios.get(path, {
  });

  return response;
};

export const pageLoading = async (path) => {
  const res = await fetch(path);

  return res.data;
};
