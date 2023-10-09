import * as Constants from './Constants';

export default class {

  static create(projectId: string, annotationId: string, text: string) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/projects/${projectId}/annotations/${annotationId}/comments/`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify({ text })
    }).then(response => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_CREATE_COMMENT_AUTH);
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_ANNOTATION_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static update(projectId: string, annotationId: string, commentId: string, text: string) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/projects/${projectId}/annotations/${annotationId}/comments/${commentId}`, {
      method: 'PUT',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify({ text })

    }).then(response => {
      if (response.status === 200 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_COMMENT_AUTH);
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_COMMENT_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static delete(projectId: string, annotationId: string, commentId: string) {
    return fetch(`/api/projects/${projectId}/annotations/${annotationId}/comments/${commentId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(response => {
      if (response.status === 204) {
        return Promise.resolve();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_DELETE_COMMENT_AUTH);
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_COMMENT_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }
}