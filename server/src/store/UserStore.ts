import { generateConfirmationCode } from 'auth/Utils';
import * as bcrypt from 'bcrypt';
import builder from 'common/Postgres';

function hashPassword(password) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

export function create(username, email, password) {
  return builder('User')
    .insert({
      id: builder.raw('uuid_generate_v4()'),
      email,
      password: hashPassword(password),
      username,
      code: generateConfirmationCode(),
      codeGeneratedAt: builder.raw('NOW()'),
      confirmed: false
    })
    .returning('*')
    .then(assertExactlyOneRow);
}

export function updatePasswordByEmail(email, password) {
  return builder('User')
    .update({ password: hashPassword(password) })
    .where('email', email)
    .returning('*')
    .then(assertExactlyOneRow);
}

export function updateCodeByEmail(email) {
  return builder('User')
    .update({
      code: generateConfirmationCode(),
      codeGeneratedAt: builder.raw('NOW()')
    })
    .where('email', email)
    .returning('*')
    .then(assertExactlyOneRow);
}

export function confirmByEmail(email) {
  return builder('User')
    .update({ code: null, codeGeneratedAt: null, confirmed: true })
    .where('email', email)
    .returning('*')
    .then(assertExactlyOneRow);
}

export function getById(id) {
  return builder('User')
    .first()
    .where('id', id);
}

export function getByEmail(email) {
  return builder('User')
    .first()
    .where('email', email);
}

function assertExactlyOneRow(rows) {
  if (rows.length === 1) {
    return Promise.resolve(rows[0]);
  } else {
    console.error(
      'Update or insert result has less or more than one row',
      rows
    );
    return Promise.reject(Error('NotExactlyOneRow'));
  }
}
