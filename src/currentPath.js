import { parse } from 'path';

const asdf = (part) => {
  return part.split('.').join('-');
}

const getCurrentPath = (path) => {
  const { dir, base } = parse(path);
  const [, parts] = dir.split('://');
  const result = parts.split('/').map((part) => asdf(part)).join('-');

  return `${result}-${base}`;
};

export default getCurrentPath;
