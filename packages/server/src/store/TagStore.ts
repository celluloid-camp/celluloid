import { database, getExactlyOne } from 'backends/Database';
import { TagData } from '@celluloid/types';

export function selectAll() {
  return database.select()
    .from('Tag');
}

export function insert(tag: TagData) {
  return database('Tag')
    .insert({
      'id': database.raw('uuid_generate_v4()'),
      'name': tag.name,
      'featured': tag.featured
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