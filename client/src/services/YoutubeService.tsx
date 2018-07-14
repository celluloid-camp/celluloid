import * as queryString from 'query-string';

const apiKey = 'AIzaSyC05D7GssUCeNl1XmV18B3c5HhLCZOYDrc';
const apiUrl = 'https://www.googleapis.com/youtube/v3/';

class YouTubeApi {
  static getVideoNameById(id: string) {

    const headers = {
      'Accepts': 'application/json'
    };

    const query = {
      part: 'snippet',
      id,
      key: apiKey
    };

    const url = `${apiUrl}videos?${queryString.stringify(query)}`;
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