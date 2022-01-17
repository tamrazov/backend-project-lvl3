const getCurrentPath = (path) => {
  const [, tt] = path.split('://');

  return `${tt.split('.').join('-').split('/').join('-')
    .split('?')[0]}`;
};

export default getCurrentPath;
