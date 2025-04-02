
export function parseUrl(url: string): { host: string; port: number | undefined; isSecure: boolean } {
  const parsedUrl = new URL(url);

  return {
    host: parsedUrl.hostname,
    port: parsedUrl.port ? Number.parseInt(parsedUrl.port, 10) : (parsedUrl.protocol === 'https:' ? 443 : 80),
    isSecure: parsedUrl.protocol === 'https:'
  };
}
