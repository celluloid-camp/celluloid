import { NewProjectData } from '../../../common/src/types/ProjectTypes';
import { AnnotationData } from '../../../common/src/types/AnnotationTypes';

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
        throw new Error(`Désolé ! Ce projet est introuvable... Peut-être a-t-il été supprimé ou privatisé ?`);
      }
      throw new Error(`Désolé ! La requête a échouée... Veuillez réessayer plus tard ou bien nous contacter`);
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
        throw new Error(`Le projet est introuvable`);
      } else if (response.status === 401) {
        throw new Error(`Veuillez vous reconnecter`);
      } else if (response.status === 403) {
        throw new Error(`Vous n'êtes pas autorisé à annoter ce projet`);
      }
      throw new Error(`La requête a échouée`);
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
        throw new Error(`Désolé ! Ce projet est introuvable... Peut-être a-t-il été supprimé ou privatisé ?`);
      } else if (response.status === 404) {
        throw new Error(`Le projet est introuvable`);
      } else if (response.status === 401) {
        throw new Error(`Veuillez vous reconnecter`);
      } else if (response.status === 403) {
        throw new Error(`Vous n'êtes pas autorisé à annoter ce projet`);
      }
      throw new Error(`Désolé ! La requête a échouée... Veuillez réessayer plus tard ou bien nous contacter`);
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
        throw new Error(`Désolé ! Ce projet est introuvable... Peut-être a-t-il été supprimé ou privatisé ?`);
      }
      throw new Error(`Désolé ! La requête a échouée... Veuillez réessayer plus tard ou bien nous contacter`);
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
      throw new Error(
        `Désolé ! La création du projet a échouée... Veuillez réessayer plus tard ou bien nous contacter`
      );
    });
  }
}