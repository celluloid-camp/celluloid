import { NewProjectData } from '@celluloid/commons';
import { AnnotationData } from '@celluloid/commons';
import * as Constants from './Constants';

export default class Projects {
  static fetch() {
    const headers = {
      'Accepts': 'application/json'
    };

    return fetch(`/api/projects/`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include'
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static getAnnotations(projectId: string) {
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

  static updateAnnotation(projectId: string, annotationId: string, annotation: AnnotationData) {
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
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_PROJECT_NOT_FOUND);
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_ANNOTATION_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static createAnnotation(projectId: string, annotation: AnnotationData) {
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
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_PROJECT_NOT_FOUND);
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_CREATE_ANNOTATION_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static deleteAnnotation(projectId: string, annotationId: string) {
    return fetch(`/api/projects/${projectId}/annotations/${annotationId}`, {
      method: 'DELETE',
      credentials: 'include',
    }).then(response => {
      if (response.status === 204) {
        // tslint:disable-next-line:no-console
        console.log('DELETED !!!!');
        return Promise.resolve();
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_PROJECT_NOT_FOUND);
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_DELETE_ANNOTATION_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static get(projectId: string) {
    const headers = {
      'Accepts': 'application/json'
    };

    return fetch(`/api/projects/${projectId}`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include'
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 404) {
        throw new Error(Constants.ERR_PROJECT_NOT_FOUND);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static create(newProject: NewProjectData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch('/api/projects', {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(newProject)
    }).then(response => {
      if (response.status === 201) {
        return response.json();
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }
}