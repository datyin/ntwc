import inquirer from 'inquirer';
import { toString } from 'lodash';
import semver from 'semver';
import globals from '../../../global';
import { Module } from '../../../schema/project';

function findDefaultIndex() {
  if (globals.project.target === 'esnext') {
    return 0;
  }

  if (semver.valid(globals.project.target) && semver.gte(globals.project.target, '12.22.0')) {
    return 2;
  }

  return 1;
}

export default async function (): Promise<void> {
  if (globals.project.module) {
    return;
  }

  const answer = await inquirer.prompt({
    type: 'list',
    name: 'module',
    message: 'Module Kind:',
    loop: false,
    choices: ['ESNext', `CommonJS`, `ESModule`],
    default() {
      return findDefaultIndex();
    },
    filter(value: string) {
      value = toString(value).toLowerCase();
      return value === 'esmodule' ? 'module' : value;
    }
  });

  globals.project.module = answer.module as Module;
}
