import {
  TeacherSignupData,
  Credentials,
  TeacherConfirmData,
  TeacherConfirmResetPasswordData,
  StudentSignupData
} from '@celluloid/types';

import * as Constants from './Constants';

export default class {
  static login(credentials: Credentials) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };
    return fetch(`/api/users/login`, {
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
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static signup(data: TeacherSignupData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/users/signup`, {
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
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static studentSignup(data: StudentSignupData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/users/student-signup`, {
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
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static confirmSignup(data: TeacherConfirmData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/users/confirm-signup`, {
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
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static resetPassword(email: string) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/users/reset-password`, {
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
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static confirmResetPassword(data: TeacherConfirmResetPasswordData) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/users/confirm-reset-password`, {
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
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static resendCode(email: string) {
    const headers = {
      Accepts: 'application/json',
      'Content-type': 'application/json'
    };

    return fetch(`/api/users/resend-code`, {
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
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static me() {
    const headers = {
      Accepts: 'application/json'
    };

    return fetch(`/api/users/me`, {
      method: 'GET',
      headers: new Headers(headers),
      credentials: 'include'
    }).then(response => {
      if (response.status === 200) {
        return response.json();
      } else if (response.status === 401) {
        return response.json();
      }
      throw new Error(Constants.ERR_UNAVAILABLE);
    });
  }

  static logout() {
    return fetch(`/api/users/logout`, {
      method: 'PUT',
      credentials: 'include'
    });
  }
}
