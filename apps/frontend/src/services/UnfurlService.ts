import * as queryString from "query-string";

export function unfurl(url: string) {
  const headers = {
    Accepts: "application/json",
  };

  return fetch(`/api/unfurl?${queryString.stringify({ url })}`, {
    method: "GET",
    headers: new Headers(headers),
    credentials: "include",
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      } else {
        return null;
      }
    })
    .catch((e) => {
      console.error(e);
      return null;
    });
}
