import { NewTeacherData, TeacherCredentials } from '../../../common/src/types/Teacher';

export default class {
  static login(credentials: TeacherCredentials) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/login`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(credentials)
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

  static signup(data: NewTeacherData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return (
      fetch(`/api/teachers/signup`, {
        method: 'POST',
        headers: new Headers(headers),
        credentials: 'include',
        body: JSON.stringify(data)
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
        })
    );
  }

  static me() {
    const headers = {
      'Accepts': 'application/json',
    };

    return fetch(`/api/teachers/me`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include'
    })
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else if (response.status === 401) {
          return response.json();
        }
        throw new Error(
          `Could not perform request (error ${response.status}`);
      });
  }

  static logout() {
    return fetch(`/api/teachers/logout`, {
      method: 'PUT',
      credentials: 'include'
    });
  }
}