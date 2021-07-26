import _ from 'lodash';
import { join } from 'path';
import semver from 'semver';
import { pathExistsSync } from 'fs-extra';
import * as version from '../lib/version';
import * as ntwc from '../configs/ntwc';
import { fullPath } from '../lib/filesystem';
import gs from '../lib/gs';
import log from '../lib/logger';
import * as Schema from '../schema/ntwc';

export default async function (cfg: unknown): Promise<void> {
  target(cfg);
  moduleKind(cfg);

  booleanValue(cfg, 'builder.bundle', false);
  booleanValue(cfg, 'builder.updateBeforeCompile', false);
  booleanValue(cfg, 'builder.cleanBeforeCompile', true);

  booleanValue(cfg, 'npm.publish', false);
  booleanValue(cfg, 'npm.private', false);

  pathValue(cfg, 'structure.bundle', fullPath('./bundle'));
  pathValue(cfg, 'structure.distribution', fullPath('./dist'));
  pathValue(cfg, 'structure.source', fullPath('./src'));

  const resources = gs.arr(cfg, 'structure.resources', []) as string[];
  _.set(ntwc.config, 'structure.resources', []);

  _.forEach(resources, (res) => {
    res = gs.str(res, undefined, '', { trim: 1, lc: 1 });

    if (!res) {
      return;
    }

    const resPath = fullPath(res);

    if (pathExistsSync(resPath)) {
      // dont use full path we need short for copy
      ntwc.config.structure.resources.push(res);
    }
  });

  entriesList(cfg);
}

function target(cfg: unknown): void {
  const input = gs.str(cfg, ['target'], version.RECOMMANDED_VERSION, { lc: 1, trim: 1 });

  if (input === 'esnext') {
    _.set(ntwc.config, 'target', 'esnext');
    return;
  }

  const versionString = version.getVersionString(input);

  if (versionString && semver.valid(versionString) && semver.gte(versionString, version.MINIMAL_VERSION)) {
    _.set(ntwc.config, ['target'], versionString);
    return;
  }

  _.set(ntwc.config, ['target'], version.RECOMMANDED_VERSION);
}

function moduleKind(cfg: unknown): void {
  const input = gs.str(cfg, ['module'], '', { lc: 1, trim: 1 });

  switch (input) {
    case 'esnext':
    case 'latest': {
      _.set(ntwc.config, ['module'], 'esnext');
      return;
    }
    case 'esmodule':
    case 'module': {
      _.set(ntwc.config, ['module'], 'module');
      return;
    }
    case 'commonjs': {
      _.set(ntwc.config, ['module'], 'commonjs');
      return;
    }
    default: {
      if (ntwc.config.target === 'esnext') {
        _.set(ntwc.config, ['module'], 'esnext');
        return;
      } else if (semver.gte(ntwc.config.target, '12.22.0')) {
        _.set(ntwc.config, ['module'], 'module');
        return;
      }

      _.set(ntwc.config, ['module'], 'commonjs');
      return;
    }
  }
}

function booleanValue(cfg: unknown, path: string, fallback: boolean): void {
  _.set(ntwc.config, path, gs.bool(cfg, path, fallback));
}

function pathValue(cfg: unknown, path: string, fallback: string): void {
  const input = gs.str(cfg, path, fallback, { lc: 1, trim: 1 });
  _.set(ntwc.config, path, fullPath(input));
}

function entriesList(cfg: unknown): void {
  const entries = gs.arr(cfg, 'entries', []) as Schema.Entry[];
  const valid: Schema.Entry[] = [];

  _.forEach(entries, (entry) => {
    const src = gs.str(entry, 'script', '', { trim: 1, lc: 1 });

    if (!src) {
      return;
    }

    const scriptPath = fullPath(join(ntwc.config.structure.source, `${src}.ts`));

    if (!pathExistsSync(scriptPath)) {
      log.warn(`Missing script file for entry: '${src}'`);
      return;
    }

    const argv = gs.str(entry, 'argv', '', { trim: 1 });
    const binaryName = gs.str(entry, 'binaryName', '', { trim: 1, lc: 1 });
    const runAfterDevBuild = gs.bool(entry, 'runAfterDevBuild', false);
    const runAfterBuild = gs.bool(entry, 'runAfterBuild', false);

    valid.push({ script: src, argv, runAfterDevBuild, runAfterBuild, binaryName, path: scriptPath });
  });

  _.set(ntwc.config, ['entries'], valid);
}
