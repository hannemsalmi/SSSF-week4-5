const fetch = require('node-fetch');

export default async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, options);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
  }

  const json = await response.json();
  return json;
};