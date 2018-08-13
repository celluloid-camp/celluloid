import { generateConfirmationCode } from 'auth/Utils';
import * as bcrypt from 'bcrypt';
import builder, { getExactlyOne } from 'utils/Postgres';

function hashPassword(password: string) {
  const salt = bcrypt.genSaltSync();
  return bcrypt.hashSync(password, salt);
}

export function createStudent(
  username: string,
  passwordHint: string,
  password: string,
) {
  console.log(username, passwordHint, password)
  return builder('User')
    .insert({
      id: builder.raw('uuid_generate_v4()'),
      passwordHint,
      password: hashPassword(password),
      username,
      confirmed: false,
      role: 'Student'
    })
    .returning('*')
    .then(getExactlyOne);
}

export function createTeacher(
  username: string,
  email: string,
  password: string
) {
  return builder('User')
    .insert({
      id: builder.raw('uuid_generate_v4()'),
      email,
      password: hashPassword(password),
      username,
      code: generateConfirmationCode(),
      codeGeneratedAt: builder.raw('NOW()'),
      confirmed: false,
      role: 'Teacher'
    })
    .returning('*')
    .then(getExactlyOne);
}

export function updatePasswordByEmail(
  email: string,
  password: string
) {
  return builder('User')
    .update({
      password: hashPassword(password)
    })
    .where('email', email)
    .returning('*')
    .then(getExactlyOne);
}

export function updateCodeByEmail(email: string) {
  return builder('User')
    .update({
      code: generateConfirmationCode(),
      codeGeneratedAt: builder.raw('NOW()')
    })
    .where('email', email)
    .returning('*')
    .then(getExactlyOne);
}

export function confirmByEmail(email: string) {
  return builder('User')
    .update({
      code: null,
      codeGeneratedAt: null,
      confirmed: true
    })
    .where('email', email)
    .returning('*')
    .then(getExactlyOne);
}

export function getById(id: string) {
  return builder('User')
    .first()
    .where('id', id);
}

export function getByEmail(email: string) {
  return builder('User')
    .first()
    .where('email', email);
}