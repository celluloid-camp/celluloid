import { paramCase } from "change-case";


export function generateUniqueShareName(title: string) {
  const compare = (a: string, b: string) => b.length - a.length;

  const result: string[] = [];

  const construct = (str: string) => {
    if (str && result.join('-').length + str.length + 1 <= 6) {
      result.push(str);
    }
  };

  paramCase(title)
    .split(/-/)
    .sort(compare)
    .forEach(construct);

  const prefix = result.join('-');

  // Generate a 4-digit random number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  return `${prefix ? prefix + '-' : ''}${randomNumber}`;
}
