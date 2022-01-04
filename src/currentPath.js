const getCurrentPath = (path) => {
  const [, tt] = path.split('://');

  return `${tt.split('.').join('-').split('/').join('-')}.html`;
};

export default getCurrentPath;
