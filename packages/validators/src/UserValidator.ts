import * as validator from 'validator';

import {
  TeacherSignupData,
  SigninResult,
  TeacherConfirmResetPasswordData,
  TeacherConfirmData,
  Credentials,
  StudentSignupData
} from '@celluloid/types';

export function validateSignup(payload: TeacherSignupData) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.username !== 'string' ||
    payload.username.trim().length === 0) {
    result.success = false;
    result.errors.username = `UsernameMissing`;
  }

  if (!payload || typeof payload.email !== 'string' ||
    !validator.isEmail(payload.email)) {
    result.success = false;
    result.errors.email = 'InvalidEmailFormat';
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'InvalidPasswordFormat';
  }
  return result;
}

export function validateConfirmationCode(code: string): boolean {
  const codeRegExp = /^[0-9]{6}$/;
  const trimmedCode = code.replace(/\s/g, '');
  return codeRegExp.test(trimmedCode);
}

export function validateConfirmResetPassword(
  payload: TeacherConfirmResetPasswordData
) {
  const result = {
    success: true,
    errors: {}
  } as SigninResult;

  if (!payload || typeof payload.login !== 'string' ||
    payload.login.trim().length === 0) {
    result.success = false;
    result.errors.login = 'MissingLogin';
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'InvalidPasswordFormat';
  }

  if (!payload || typeof payload.code !== 'string' ||
    !validateConfirmationCode(payload.code)) {
    result.success = false;
    result.errors.code = `InvalidCodeFormat`;
  }
  return result;
}

export function validateConfirmSignup(payload: TeacherConfirmData) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.login !== 'string' ||
    payload.login.trim().length === 0) {
    result.success = false;
    result.errors.email = 'MissingLogin';
  }

  if (!payload || typeof payload.code !== 'string' ||
    !validateConfirmationCode(payload.code)) {
    result.success = false;
    result.errors.code = `InvalidCodeFormat`;
  }

  return result;
}

export function validateLogin(payload: Credentials) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.login !== 'string' ||
    payload.login.trim().length === 0) {
    result.success = false;
    result.errors.login = `MissingLogin`;
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length === 0) {
    result.success = false;
    result.errors.password = 'MissingPassword';
  }

  return result;
}

export function validateStudentSignup(payload: StudentSignupData) {
  const result = { success: true, errors: {} } as SigninResult;

  if (!payload || typeof payload.projectShareName !== 'string' ||
    payload.projectShareName.trim().length === 0) {
    result.success = false;
    result.errors.username = `MissingShareName`;
  }

  if (!payload || typeof payload.projectSharePassword !== 'string' ||
    payload.projectSharePassword.trim().length === 0) {
    result.success = false;
    result.errors.username = `MissingSharePassword`;
  }

  if (!payload || typeof payload.username !== 'string' ||
    payload.username.trim().length === 0) {
    result.success = false;
    result.errors.username = `MissingUsername`;
  }

  if (!payload || typeof payload.password !== 'string' ||
    payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'InvalidPasswordFormat';
  }

  if (!payload || typeof payload.passwordHint !== 'string' ||
    payload.passwordHint.trim().length === 0) {
    result.success = false;
    result.errors.passwordHint = 'MissingPasswordHint';
  }

  return result;
}