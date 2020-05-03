import { generateConfirmationCode, hashPassword } from 'auth/Utils';
import { database, getExactlyOne } from 'backends/Database';
import { QueryBuilder, Transaction } from 'knex';

export function createStudent(
  username: string,
  password: string,
  projectId: string
) {
  return database
    .transaction(transaction =>
      database('User')
        .transacting(transaction)
        .insert({
          id: database.raw('uuid_generate_v4()'),
          password: hashPassword(password),
          username,
          confirmed: false,
          role: 'Student'
        })
        .returning('*')
        .then(getExactlyOne)
        .then(student => joinProject(student.id, projectId, transaction)
          .then(() => Promise.resolve(student))
        )
        .then(transaction.commit)
        .catch(transaction.rollback)
    );
}

export function createTeacher(
  username: string,
  email: string,
  password: string
) {
  return database('User')
    .insert({
      id: database.raw('uuid_generate_v4()'),
      email,
      password: hashPassword(password),
      username,
      code: generateConfirmationCode(),
      codeGeneratedAt: database.raw('NOW()'),
      confirmed: false,
      role: 'Teacher'
    })
    .returning('*')
    .then(getExactlyOne);
}

export function updatePasswordByEmail(
  login: string,
  password: string
) {
  return database('User')
    .update({
      password: hashPassword(password)
    })
    .where('email', login)
    .orWhere('username', login)
    .returning('*')
    .then(getExactlyOne);
}

export function updateCodeByEmail(login: string) {
  return database('User')
    .update({
      code: generateConfirmationCode(),
      codeGeneratedAt: database.raw('NOW()')
    })
    .where('email', login)
    .orWhere('username', login)
    .returning('*')
    .then(getExactlyOne);
}

export function confirmByEmail(login: string) {
  return database('User')
    .update({
      code: null,
      codeGeneratedAt: null,
      confirmed: true
    })
    .where('email', login)
    .orWhere('username', login)
    .returning('*')
    .then(getExactlyOne);
}

export function selectOne(id: string) {
  return database('User')
    .first()
    .where('id', id);
}

export function selectOneByUsernameOrEmail(login: string) {
  return database('User')
    .first()
    .where('username', login)
    .orWhere('email', login);
}

function withTransaction(query: QueryBuilder, transaction?: Transaction) {
  return transaction ? query.transacting(transaction) : query;
}

export function joinProject(
  userId: string,
  projectId: string,
  transaction?: Transaction) {
  return withTransaction(database('UserToProject'), transaction)
    .insert({
      userId,
      projectId
    });
}

export function leaveProject(userId: string, projectId: string) {
  return database('UserToProject')
    .where('userId', userId)
    .andWhere('projectId', projectId)
    .del();
}
