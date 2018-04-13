
export default class Teachers {
  static login(email: string, password: string) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/login`, {
             method: 'POST',
             headers: new Headers(headers),
             credentials: 'include',
             body: JSON.stringify({email, password})
           })
        .then(response => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 400) {
            return response.json();
          } else if (response.status === 401) {
            return response.json();
          }
          throw new Error(
              `Could not perform request (error ${response.status}`);
        });
  }

  static signup(email: string, password: string) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/signup`, {
             method: 'POST',
             headers: new Headers(headers),
             credentials: 'include',
             body: JSON.stringify({email, password})
           })
        .then(response => {
          if (response.status === 200) {
            return response.json();
          } else if (response.status === 400) {
            return response.json();
          } else if (response.status === 409) {
            return response.json();
          }
          throw new Error(
              `Could not perform request (error ${response.status}`);
        });
  }
}