import { paramCase } from "change-case";

export function generateUniqueShareName(title: string) {
  const result = paramCase(title)
    .split(/-/)
    .sort((a: string, b: string) => b.length - a.length)
    .reduce((acc: string[], str: string) => {
      if (acc.join('-').length < 6) {
        acc.push(str);
      }
      return acc;
    }, []);
  const prefix = result.join('-');
  // Generate a 4-digit random number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);
  return `${prefix ? prefix + '-' : ''}${randomNumber}`;
}
