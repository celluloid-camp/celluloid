import * as auth from 'auth/Local';
import {isLoggedIn, sendConfirmationCode} from 'auth/Utils';
import * as express from 'express';
import * as UserStore from 'store/UserStore';
import * as validator from 'validator';

import {SigninValidation} from '../../../common/src/types/TeacherTypes';

const router = express.Router();

function validateSignup(payload) {
  const result = {success: true, errors: {}} as SigninValidation;

  if (!payload || typeof payload.username !== 'string' ||
      payload.password.trim().length < 1) {
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

function validateConfirmationCode(code: string): boolean {
  const codeRegExp = /^[0-9]{6}$/
  const trimmedCode = code.replace(/\s/g, '');
  return codeRegExp.test(trimmedCode);
}

function validateConfirmResetPassword(payload) {
  const result = {success: true, errors: {}} as SigninValidation;

  if (!payload || typeof payload.email !== 'string' ||
      payload.email.trim().length === 0) {
    result.success = false;
    result.errors.email = 'InvalidEmailFormat';
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

function validateConfirmSignup(payload) {
  const result = {success: true, errors: {}} as SigninValidation;
  if (!payload || typeof payload.email !== 'string' ||
      !validator.isEmail(payload.email)) {
    result.success = false;
    result.errors.email = 'InvalidEmailFormat';
  }

  if (!payload || typeof payload.code !== 'string' ||
      !validateConfirmationCode(payload.code)) {
    result.success = false;
    result.errors.code = `InvalidCodeFormat`;
  }

  return result;
}

function validateLogin(payload) {
  const result = {success: true, errors: {}} as SigninValidation;

  if (!payload || typeof payload.email !== 'string' ||
      payload.email.trim().length === 0) {
    result.success = false;
    result.errors.email = `MissingEmail`;
  }

  if (!payload || typeof payload.password !== 'string' ||
      payload.password.trim().length === 0) {
    result.success = false;
    result.errors.password = 'MissingPassword';
  }

  return result;
}

router.post('/signup', (req, res, next) => {
  const result = validateSignup(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return auth.authenticate('local-signup', error => {
    if (error) {
      console.error(
          `Failed to sign user up with email ${req.body.email}`, error);
      if (error.code === '23505' &&
          error.constraint === 'Teacher_username_key') {
        res.status(409).json(
            {success: false, errors: {username: 'UsernameAlreadyExists'}});
      } else if (
          error.code === '23505' && error.constraint === 'Teacher_email_key') {
        res.status(409).json(
            {success: false, errors: {email: 'EmailAlreadyExists'}});
      } else {
        res.status(500).json({success: false, errors: {server: error.message}});
      }
    } else {
      console.log(`New signup from user with email ${req.body.email}`, result);
      res.status(201).json(result);
    }
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  const result = validateLogin(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return auth.authenticate('local-login', (error, user, info) => {
    if (error) {
      result.success = false;
      result.errors = {server: error.message};
      return res.status(401).json(result);
    } else {
      return req.login(user, err => {
        if (err) {
          result.success = false;
          result.errors = {server: error.message};
          res.status(500).json(result);
        } else {
          res.status(200).json(result);
        }
      });
    }
  })(req, res, next);
});

function compareCodes(expected, actual) {
  return expected.replace(/\s/g, '') === actual.replace(/\s/g, '');
}

router.post('/confirm-signup', (req, res, next) => {
  const payload = req.body;
  const result = validateConfirmSignup(payload);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return UserStore.getByEmail(payload.email).then(user => {
    if (!user) {
      console.error(`Failed to confirm signup: user with email ${
          payload.email} not found`);
      return res.status(401).json(
          {success: false, errors: {server: 'InvalidUser'}});
    } else {
      if (compareCodes(user.code, payload.code)) {
        return UserStore.confirmByEmail(payload.email)
            .then(() => {
              return res.status(200).json({success: true, errors: {}});
            })
            .catch(error => {
              console.error(
                  `Failed to confirm signup for user with email ${
                      payload.email}`,
                  error);
              return res.status(500).json(
                  {success: true, errors: {server: 'RequestFailed'}});
            });
      } else {
        console.error(`Failed to confirm signup for user with email ${
            payload.email}: received code ${payload.code}, expected ${
            user.code}`);
        return res.status(401).json(
            {success: false, errors: {server: 'InvalidUser'}});
      }
    }
  })
});

router.post('/confirm-reset-password', (req, res) => {
  const payload = req.body;
  const result = validateConfirmResetPassword(payload);
  if (!result.success) {
    return res.status(400).json(result);
  }
  return UserStore.getByEmail(payload.email).then(user => {
    if (!user) {
      console.error(`Failed to confirm password reset: user with email ${
          payload.email} not found`);
      return res.status(401).json(
          {success: false, errors: {server: 'InvalidUser'}});
    } else {
      if (compareCodes(user.code, payload.code)) {
        return UserStore
            .updatePasswordByEmail(payload.email.trim(), payload.password)
            .then(() => {
              return res.status(200).json({success: true, errors: {}});
            })
            .catch(error => {
              console.error(
                  `Failed to confirm password reset for user with email ${
                      payload.email}`,
                  error);
              return res.status(500).json(
                  {success: true, errors: {server: 'RequestFailed'}});
            });
      } else {
        return res.status(401).json(
            {success: false, errors: {server: 'InvalidUser'}});
        console.error(`Failed to confirm password reset for user with email ${
            payload.email}: received code ${payload.code}, expected ${
            user.code}`);
      }
    }
  })
});

function resendCode(req, res) {
  const payload = req.body;
  if (!payload.email || payload.email.trim().length === 0) {
    return res.status(400).json(
        {success: false, errors: {email: 'MissingEmail'}});
  }
  return UserStore.getByEmail(payload.email).then(user => {
    if (!user) {
      console.error(`Failed to resend authorization code: user with email ${
          payload.email} not found`);
      return res.status(401).json(
          {success: false, errors: {server: 'InvalidUser'}});
    } else {
      return UserStore.updateCodeByEmail(payload.email).then(user => {
        console.log('User', user);
        sendConfirmationCode(user.code, user)
            .then(
                () => {
                    return res.status(200).json({success: true, errors: {}})})
            .catch(error => {
              console.error(
                  `Failed to resend authorization code for user with email ${
                      payload.email}`,
                  error);
              return res.status(500).json(
                  {success: true, errors: {server: 'RequestFailed'}});
            });
      });
    }
  });
}


router.post('/reset-password', (req, res) => {
  return resendCode(req, res);
});

router.post('/resend-code', (req, res) => {
  return resendCode(req, res);
});

router.get('/me', isLoggedIn, (req, res) => {
  return res.status(200).json({
    teacher: {
      email: req.user.email,
      name: req.user.name,
      lastName: req.user.lastName,
      firstName: req.user.firstName,
      id: req.user.id
    }
  });
});

router.put('/logout', isLoggedIn, (req, res) => {
  req.logout();
  return res.status(200).send();
});

export default router;