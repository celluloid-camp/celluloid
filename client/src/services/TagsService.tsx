export default class Tags {
  static fetch() {
    const headers = {
      'Accepts': 'application/json'
    };

    return fetch(`/api/tags`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include'
    }).then(response => {
      if (response.status === 200) {
        return response
          .json();
      }
      throw new Error(`Could not perform request (error ${response.status})`);
    });
  }
}