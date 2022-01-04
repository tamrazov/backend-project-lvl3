const getCurrentPath = (path, url) => {
  console.log(path)
  let [, tt] = path.split('://');

  return tt.split('.').join('-').split('/').join('-') + '.html'
}

export default getCurrentPath;
