import { parse } from 'path';

const asdf = (part) => {
  return part.split('.').join('-');
}

const getCurrentPath = (path) => {
  const { name, ext } = parse(path);
  const curBase = name.split('?')[0];

  return `${asdf(curBase)}${ext ?? '.jpg'}`;
};

export default getCurrentPath;
