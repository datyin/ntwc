import _ from 'lodash';
import { join } from 'path';
import semver from 'semver';
import * as version from '../lib/version';
import * as ntwc from '../configs/ntwc';
import { isActive } from '../lib/primitive';
import { getValue } from './common';
import { fullPath } from '../lib/filesystem';
import { pathExistsSync } from 'fs-extra';
import log from '../lib/logger';
import * as Schema from '../schema/ntwc';

export default async function (cfg: unknown): Promise<void> {
  target(cfg);
  moduleKind(cfg);

  booleanValue(cfg, 'builder.bundle', false);
  booleanValue(cfg, 'builder.updateBeforeCompile', false);
  booleanValue(cfg, 'builder.cleanBeforeCompile', true);

  pathValue(cfg, 'structure.bundle', fullPath('./bundle'));
  pathValue(cfg, 'structure.distribution', fullPath('./dist'));
  pathValue(cfg, 'structure.source', fullPath('./src'));

  entriesList(cfg);
}

function target(cfg: unknown): void {
  const input = getValue(cfg, 'target', version.RECOMMANDED_VERSION);

  if (input === 'esnext') {
    _.set(ntwc.config, 'target', 'esnext');
    return;
  }

  const versionString = version.getVersionString(input);

  if (
    versionString &&
    semver.valid(versionString) &&
    semver.gte(versionString, version.MINIMAL_VERSION)
  ) {
    _.set(ntwc.config, 'target', versionString);
    return;
  }

  _.set(ntwc.config, 'target', version.RECOMMANDED_VERSION);
}

function moduleKind(cfg: unknown): void {
  const input = getValue(cfg, 'module', undefined);

  switch (input) {
    case 'esnext':
    case 'latest': {
      _.set(ntwc.config, 'module', 'esnext');
      return;
    }
    case 'esmodule':
    case 'module': {
      _.set(ntwc.config, 'module', 'module');
      return;
    }
    case 'commonjs': {
      _.set(ntwc.config, 'module', 'commonjs');
      return;
    }
    default: {
      if (ntwc.config.target === 'esnext') {
        _.set(ntwc.config, 'module', 'esnext');
        return;
      } else if (semver.gte(ntwc.config.target, '12.22.0')) {
        _.set(ntwc.config, 'module', 'module');
        return;
      }

      _.set(ntwc.config, 'module', 'commonjs');
      return;
    }
  }
}

function booleanValue(cfg: unknown, path: string, fallback: unknown): void {
  const input = getValue(cfg, path, fallback);
  _.set(ntwc.config, path, isActive(input));
}

function pathValue(cfg: unknown, path: string, fallback: unknown): void {
  const input = getValue(cfg, path, fallback);
  _.set(ntwc.config, path, fullPath(input));
}

function entriesList(cfg: unknown): void {
  let entries = _.get(cfg, 'entries', []) as Schema.Entry[];

  if (!_.isArray(entries)) {
    entries = [];
  }

  const valid: Schema.Entry[] = [];

  _.forEach(entries, (entry) => {
    const src = _.toString(_.get(entry, 'script', '')).trim().toLowerCase();

    if (!src) {
      return;
    }

    const scriptPath = join(ntwc.config.structure.source, `${src}.ts`);

    if (!pathExistsSync(scriptPath)) {
      log.warn(`Missing script file for entry: '${src}'`);
      return;
    }

    const argv = _.toString(_.get(entry, 'argv', '')).trim();
    const runAfterDevBuild = isActive(_.get(entry, 'runAfterDevBuild', false));
    const runAfterBuild = isActive(_.get(entry, 'runAfterBuild', false));

    valid.push({
      script: src,
      argv,
      runAfterDevBuild,
      runAfterBuild
    });
  });

  _.set(ntwc.config, 'entries', valid);
}
