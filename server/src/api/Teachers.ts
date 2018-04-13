import * as express from 'express';

import pool from '../common/Postgres';
import * as validator from 'validator';

import * as auth from '../auth/Local';

import { SignupValidation, LoginValidation } from '../../../common/src/types/Teacher';

import { loginRequired } from '../auth/Utils';

const router = express.Router();

function validateSignup(payload) {
  const result = {
    success: true,
    errors: {}
  } as SignupValidation;

  if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
    result.success = false;
    result.errors.email = 'Please provide a correct email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    result.success = false;
    result.errors.password = 'Password must have at least 8 characters.';
  }

  return result;
}

function validateLogin(payload) {
  const result = {
    success: true,
    errors: {}
  } as LoginValidation;

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    result.success = false;
    result.errors.email = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    result.success = false;
    result.errors.password = 'Please provide your password.';
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
      result.success = false;
      res.status(400).json(result);
    } else {
      res.status(200).json(result);
    }
  })(req, res, next);
});

router.post('/login', (req, res, next) => {
  const result = validateSignup(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return auth.authenticate('local-login', (error, user, info) => {
    if (error) {
      result.success = false;
      res.status(401).json(result);
    } else {
      req.login(user, err => {
        if (err) {
          result.success = false;
          res.status(500).json(result);
        } else {
          res.status(200).json(result);
        }
      });
    }
  })(req, res, next);
});

router.get('/me', loginRequired, (req, res, next) => {
  return res.status(200).json({
    teacher: {
       email: req.user.email,
       name: req.user.name
    }
  });
});

router.put('/logout', loginRequired, (req, res, next) => {
  req.logout();
  return res.status(200).send();
});

export = router;