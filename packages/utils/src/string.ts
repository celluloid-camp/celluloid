
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
  return `${prefix ? `${prefix}-` : ''}${randomNumber}`;
}

export function paramCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateRandomString(prefix?: string): string {
  const randomNumber = Math.random().toString(36).substring(2, 8);
  return `${prefix ? `${prefix}-` : ''}${randomNumber}`;
}
