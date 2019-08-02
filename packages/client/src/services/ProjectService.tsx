import { ProjectCreateData, ProjectShareData, ProjectUpdateData } from '@celluloid/types';

import * as Constants from './Constants';

export default class Projects {
  static list() {
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

  static getMembers(projectId: string) {
    const headers = {
      'Accepts': 'application/json'
    };

    return fetch(`/api/projects/${projectId}/members`, {
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

  static create(project: ProjectCreateData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch('/api/projects', {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(project)
    }).then(response => {
      if (response.status === 201 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      }
      throw new Error(Constants.ERR_ALREADY_EXISTING_PROJECT);
    });
  }

  static update(projectId: string, project: ProjectUpdateData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/projects/${projectId}`, {
      method: 'PUT',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(project)
    }).then(response => {
      if (response.status === 200 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_PROJECT_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static share(projectId: string, data: ProjectShareData) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/projects/${projectId}/share`, {
      method: 'PUT',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status === 200 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_PROJECT_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static unshare(projectId: string) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/projects/${projectId}/share`, {
      method: 'DELETE',
      headers: new Headers(headers),
      credentials: 'include',
    }).then(response => {
      if (response.status === 200 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_PROJECT_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static setAttribute(projectId: string, attribute: 'collaborative' | 'public', on: boolean) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/projects/${projectId}/${attribute}`, {
      method: on ? 'PUT' : 'DELETE',
      headers: new Headers(headers),
      credentials: 'include',
    }).then(response => {
      if (response.status === 200 || response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_PROJECT_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static delete(projectId: string) {
    const headers = {
      'Accepts': 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
      headers: new Headers(headers),
      credentials: 'include',
    }).then(response => {
      if (response.status === 204 || response.status === 400) {
        return Promise.resolve();
      } else if (response.status === 401) {
        throw new Error(Constants.ERR_NOT_LOGGED_IN);
      } else if (response.status === 403) {
        throw new Error(Constants.ERR_UPDATE_PROJECT_AUTH);
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }
}
