import * as queryString from 'query-string';

class YouTubeApi {
  static getVideoNameById(id: string) {

    const headers = {
      'Accepts': 'application/json'
    };

    const query = {
      id,
    };

    const url = `/api/video?${queryString.stringify(query)}`;
    return fetch(url, {
      method: 'GET',
      headers: new Headers(headers),
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error(`Could not perform YouTube API request (error ${response.status})`);
    }).then(json => {
      if (json.pageInfo.totalResults === 1) {
        return Promise.resolve(json.items[0].snippet.title);
      }
      throw new Error(`No result from YouTube API for video id: ${id}`);
    });
  }
}

export default YouTubeApi;