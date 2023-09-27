import { paramCase } from 'change-case';
import _ from 'lodash';

export function generateUniqueShareName(title: string) {
  const compare = (a: string, b: string) =>
    b.length - a.length;

  const construct = (result: string[], str: string) => {
    let res: string[] = []
    if (str) {
      if (result.join().length < 6) {
        res = [...result, str];
      }
    }
    return res;
  };

  const prefix = paramCase(title)
    .split(/-/)
    .sort(compare)
    .reduce(construct, [])
    .join('-');

  return _.uniqueId(prefix);
}
