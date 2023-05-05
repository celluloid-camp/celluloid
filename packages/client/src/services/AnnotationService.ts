import { AnnotationData } from '@celluloid/types';

import * as Constants from './Constants';

export default class {
  static list(projectId: string) {
    const headers = {
      'Accepts': 'application/json'
    };

    return fetch(`/api/projects/${projectId}/annotations`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include',
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_PROJECT_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static create(projectId: string, annotation: AnnotationData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/projects/${projectId}/annotations`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(annotation)
    }).then(response => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_CREATE_ANNOTATION_AUTH);
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_PROJECT_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static update(projectId: string, annotationId: string, annotation: AnnotationData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/projects/${projectId}/annotations/${annotationId}`, {
      method: 'PUT',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(annotation)

    }).then(response => {
      if (response.status === 200 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_ANNOTATION_AUTH);
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_ANNOTATION_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static delete(projectId: string, annotationId: string) {
    return fetch(`/api/projects/${projectId}/annotations/${annotationId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(response => {
      if (response.status === 204) {
        return Promise.resolve();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_DELETE_ANNOTATION_AUTH);
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_ANNOTATION_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }
}