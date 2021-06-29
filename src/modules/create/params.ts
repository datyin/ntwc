import { get, set, toString, trim } from 'lodash';
import semver from 'semver';
import validPackageName from 'validate-npm-package-name';
import { getParam } from '../../common/params';
import globals from '../../global';
import { getVersionString, MINIMAL_VERSION } from '../../lib/version';
import * as Schema from '../../schema/primitives';

import askForProject from './questions/project';
import askForTarget from './questions/target';
import askForModule from './questions/module';
import askForAddons from './questions/addons';

const setName = (input: unknown): void => {
  if (typeof input !== 'string') {
    return;
  }

  input = trim(input).toLowerCase().replace(/\s+/g, '-');
  const isName = validPackageName(input as string);

  if (isName.validForNewPackages && isName.validForOldPackages) {
    globals.project.name = input as string;
  }
};

const setTarget = (input: unknown): void => {
  const str = trim(toString(input)).toLowerCase();

  switch (str) {
    case 'esnext':
    case 'latest': {
      globals.project.target = 'esnext';
      return;
    }
    case 'current':
    case 'installed': {
      globals.project.target = process.versions.node as Schema.SemVerNumber;
      return;
    }
    default: {
      const version = getVersionString(input);

      if (version && semver.valid(version) && semver.gte(version, MINIMAL_VERSION)) {
        globals.project.target = version;
      }

      return;
    }
  }
};

const setModuleKind = (input: unknown): void => {
  const str = trim(toString(input)).toLowerCase();

  switch (str) {
    case 'esnext':
    case 'latest': {
      globals.project.module = 'esnext';
      return;
    }
    case 'module':
    case 'esmodule': {
      globals.project.module = 'module';
      return;
    }
    case 'commonjs': {
      globals.project.module = 'commonjs';
      return;
    }
  }
};

const setAddon = (addon: string, input: unknown): void => {
  if (!addon) {
    return;
  }

  const addonFound = get(globals.project.addons, addon, false);

  if (addonFound) {
    input = toString(input).toLowerCase();

    if (input === 'true') {
      set(globals.project.addons, addon, true);
    } else if (input === 'false') {
      set(globals.project.addons, addon, false);
    }
  }
};

const setDescription = (input: unknown): void => {
  const str = trim(toString(input));

  if (str) {
    globals.project.description = str;
  }
};

const setAuthor = (input: unknown): void => {
  const str = trim(toString(input));

  if (str) {
    globals.project.author = str;
  }
};

const setVersion = (input: unknown): void => {
  const str = trim(toString(input));

  if (str && semver.valid(str)) {
    globals.project.version = str as Schema.SemVerNumber;
  }
};

export const parse = async (): Promise<void> => {
  const name = getParam('name', 'n');
  const target = getParam('target', 't');
  const moduleKind = getParam('module', 'm');
  const webpack = getParam('webpack', 'wpk');
  const eslint = getParam('eslint', 'esl');
  const prettier = getParam('prettier', 'prt');

  setName(name);
  setTarget(target);
  setModuleKind(moduleKind);
  setAddon('webpack', webpack);
  setAddon('eslint', eslint);
  setAddon('prettier', prettier);
};

export const answers = async (): Promise<void> => {
  const answers = await askForProject();
  setName(answers.name);
  setDescription(answers.description);
  setAuthor(answers.author);
  setVersion(answers.version);

  await askForTarget();
  await askForModule();
  await askForAddons();
};
