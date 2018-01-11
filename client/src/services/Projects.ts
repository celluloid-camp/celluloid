import { NewProjectData } from '../types/Project';

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
      throw new Error(`Could not perform request (error ${response.status})`);
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
      }
      throw new Error(`Could not perform request (error ${response.status})`);
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
      throw new Error(`Oops! Project creation failed (code ${response.status})`);
    });
  }
}