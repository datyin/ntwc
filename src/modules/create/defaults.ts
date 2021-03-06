import { last } from 'lodash';
import globals from '../../global';
import { getGitUser } from '../../lib/git';

export function getDefaultName(): string {
  const path = globals.project.root;

  if (!path) {
    return 'ntwc-project';
  }

  return last(path.split('/')) ?? 'ntwc-project';
}

export function getDefaultAuthor(): string {
  const user = getGitUser();

  if (user.name) {
    return user.email ? `${user.name} <${user.email}>` : user.name;
  }

  return '';
}
