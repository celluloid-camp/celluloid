import { database, getExactlyOne } from 'backends/Database';

export function selectAll() {
  return database.select()
    .from('Tag');
}

export function insert(name: string) {
  return database('Tag')
    .insert({
      'id': database.raw('uuid_generate_v4()'),
      'name': name,
      'featured': false
    })
    .returning('*')
    .then(getExactlyOne);
}

export function tagProject(tagId: string, projectId: string) {
  return database('TagToProject')
    .insert({
      tagId,
      projectId
    });
}

export function untagProject(tagId: string, projectId: string) {
  return database('TagToProject')
    .insert({
      tagId,
      projectId
    });
}