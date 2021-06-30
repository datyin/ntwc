import { join } from 'path';
import fs from 'fs-extra';
import _ from 'lodash';
import JSON5 from 'json5';
import log from './logger';

export function pathSlash(input: string): string {
  input = _.trim(_.toString(input)).replace(/\\/g, '/').replace(/\/\//g, '/');

  if (input !== './') {
    input = _.trimEnd(input, '/');
  }

  return input;
}

export function fullPath(input: string): string {
  input = pathSlash(input);

  if (input === './') {
    input = pathSlash(process.cwd());
  } else if (input.startsWith('./')) {
    input = pathSlash(join(process.cwd(), input));
  }

  return input;
}

export function readJson(path: string, fallback: unknown = null): unknown {
  path = fullPath(path);

  try {
    let content = fs.readFileSync(path, { encoding: 'utf8' });
    content = _.toString(content);

    // Strip Bom
    // Credits goes to https://github.com/sindresorhus/strip-bom/blob/main/index.js
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    return JSON5.parse(content);
  } catch (error) {
    log.error('readJson failed', error?.message ?? '');
    return fallback;
  }
}

export function saveJson(path: string, content: unknown, spaces = 2): boolean {
  path = fullPath(path);

  if (_.isUndefined(content) || _.isNull(content)) {
    return false;
  }

  try {
    fs.writeFileSync(path, JSON.stringify(content, undefined, spaces), {
      encoding: 'utf8'
    });

    return true;
  } catch (error) {
    if (error?.message) {
      log.error(error.message);
    }

    return false;
  }
}

export function saveConfig(path: string, content: unknown, spaces = 2): boolean {
  path = fullPath(path);

  if (_.isUndefined(content) || _.isNull(content)) {
    return false;
  }

  if (path.endsWith('.json')) {
    return saveJson(path, content, spaces);
  } else {
    try {
      content = `module.exports = ${JSON5.stringify(content, undefined, spaces)};\n`;
      fs.writeFileSync(path, _.toString(content), { encoding: 'utf8' });
      return true;
    } catch (error) {
      if (error?.message) {
        log.error(error.message);
      }

      return false;
    }
  }
}

export function isEmptyDirectory(path: string): boolean {
  path = fullPath(path);

  try {
    const contents = fs.readdirSync(path, { encoding: 'utf8' });
    return !contents.length;
  } catch {
    return true;
  }
}

export function emptyDir(path: string): boolean {
  try {
    path = fullPath(path);
    fs.emptyDirSync(path);

    return true;
  } catch (error) {
    if (error?.message) {
      log.error(error.message);
    }

    return false;
  }
}

export function createDir(path: string): boolean {
  path = fullPath(path);

  try {
    fs.ensureDirSync(path);
    return true;
  } catch (error) {
    if (error.message) {
      log.error(error.message);
    }

    return false;
  }
}

export function createFile(path: string, content: unknown, overwrite = false): boolean {
  path = fullPath(path);

  try {
    if (!overwrite && fs.pathExistsSync(path)) {
      return false;
    }

    if (_.isArray(content)) {
      content = content.join('\n') + '\n';
    }

    fs.outputFileSync(path, content, { encoding: 'utf8' });

    return true;
  } catch (error) {
    if (error.message) {
      log.error(error.message);
    }

    return false;
  }
}

export function copy(from: string, to: string): boolean {
  try {
    from = fullPath(from);
    to = fullPath(to);

    fs.copySync(from, to);
    return true;
  } catch (error) {
    if (error?.message) {
      log.error(error.message);
    }

    return false;
  }
}
