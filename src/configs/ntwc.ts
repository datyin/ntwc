import _ from 'lodash';
import log from '../lib/logger';
import { RECOMMANDED_VERSION } from '../lib/version';
import { readJson, saveConfig } from '../lib/filesystem';
import globals from '../global';
import validate from '../validator/ntwc';
import * as Schema from '../schema/ntwc';

const fileName = '.ntwcrc.json';

export const config: Schema.Config = {
  target: RECOMMANDED_VERSION,
  module: 'module',
  structure: {
    bundle: './bundle',
    distribution: './dist',
    source: './src'
  },
  builder: {
    bundle: false,
    updateBeforeCompile: false,
    cleanBeforeCompile: true
  },
  entries: [
    {
      script: 'index',
      argv: '',
      runAfterDevBuild: true,
      runAfterBuild: false
    }
  ]
};

export async function create(): Promise<void> {
  log.print(`⏳  Generating ${fileName}...`);

  config.target = globals.project.target as Schema.Target;
  config.module = globals.project.module as Schema.Module;

  if (globals.project.addons.webpack) {
    _.set(config, 'builder.bundle', true);
  }

  if (!saveConfig(`./${fileName}`, config)) {
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
}

export async function save(): Promise<void> {
  log.print(`⏳  Updating ${fileName}...`);

  if (!saveConfig(`./${fileName}`, config)) {
    log.error(`❌  Failed to update ${fileName}`);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} updated.`);
}

// prettier-ignore
export async function load(): Promise<void> {
  const cfg = readJson(`./${fileName}`) as Record<string, unknown>;

  if (!cfg || !_.isPlainObject(cfg)) {
    log.error(`Malformed ${fileName}`);
    process.exit(1);
  }

  await validate(cfg);
}
