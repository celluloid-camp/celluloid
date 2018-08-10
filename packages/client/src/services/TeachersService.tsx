import {
  TeacherSignupData,
  TeacherCredentials,
  TeacherConfirmData,
  TeacherConfirmResetPasswordData
} from '@celluloid/commons';

export default class {
  static login(credentials: TeacherCredentials) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/teachers/login`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(credentials)
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static signup(data: TeacherSignupData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/signup`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status === 201) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 409) {
        return response.json();
      } else if (response.status === 500) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static confirmSignup(data: TeacherConfirmData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/confirm-signup`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static resetPassword(email: string) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/reset-password`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify({ email })
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static confirmResetPassword(data: TeacherConfirmResetPasswordData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/confirm-reset-password`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify(data)
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static resendCode(email: string) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/teachers/resend-code`, {
      method: 'POST',
      headers: new Headers(headers),
      credentials: 'include',
      body: JSON.stringify({ email })
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 400) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static me() {
    const headers = {
      Accepts: 'application/json'
    };

    return fetch(`/api/teachers/me`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include'
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(`Could not perform request (error ${response.status}`);
    });
  }

  static logout() {
    return fetch(`/api/teachers/logout`, {
      method: 'PUT',
      credentials: 'include'
    });
  }
}
