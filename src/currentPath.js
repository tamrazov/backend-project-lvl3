import { parse } from 'path';

const asdf = (part) => {
  return part.split('.').join('-');
}

const getCurrentPath = (path) => {
  const { dir, base,  name, ext } = parse(path);
  console.log(parse(path))

  return `${asdf(base)}-${asdf(name)}`;
};

export default getCurrentPath;
