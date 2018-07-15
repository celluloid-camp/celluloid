import {generateConfirmationCode} from 'auth/Utils';
import * as bcrypt from 'bcrypt';
import builder from 'common/Postgres';

export function create(username, email, password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  return builder('Teacher')
      .insert({
        id: builder.raw('uuid_generate_v4()'),
        email,
        password: hash,
        username,
        code: generateConfirmationCode(),
        codeGeneratedAt: builder.raw('NOW()'),
        confirmed: false
      })
      .returning('*')
      .then(result => {
        return result[0];
      });
}

export function updatePasswordByEmail(email, password) {
  const salt = bcrypt.genSaltSync();
  const hash = bcrypt.hashSync(password, salt);

  return builder()
      .update({password: hash})
      .where('email', email)
      .returning('*');
}

export function updateCodeByEmail(email) {
  return builder('Teacher')
      .update({
        code: generateConfirmationCode(),
        codeGeneratedAt: builder.raw('NOW()')
      })
      .where('email', email)
      .returning('*');
}

export function confirmByEmail(email) {
  return builder('Teacher')
      .update({code: null, codeGeneratedAt: null, confirmed: true})
      .where('email', email)
      .returning('*');
}

export function getById(id) {
  return builder('Teacher').first().where('id', id);
}

export function getByEmail(email) {
  return builder('Teacher').first().where('email', email);
}