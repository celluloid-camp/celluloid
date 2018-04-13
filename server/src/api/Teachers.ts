import * as express from 'express';

import pool from '../common/Postgres';
import * as validator from 'validator';

import { SignupValidation, LoginValidation } from '../../../common/src/types/Teacher';

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

router.post('/signup', (req, res) => {
  const result = validateSignup(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.status(200).json(result);
});

router.post('/login', (req, res) => {
  const result = validateSignup(req.body);

  if (!result.success) {
    return res.status(400).json(result);
  }
  return res.status(200).json(result);
});

export = router;