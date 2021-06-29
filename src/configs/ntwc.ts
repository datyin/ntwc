import { assignIn, isPlainObject, set } from 'lodash';
import log from '../lib/logger';
import { RECOMMANDED_VERSION } from '../lib/version';
import { readJson, saveConfig } from '../lib/filesystem';
import globals from '../global';
import * as Schema from '../schema/ntwc';

const fileName = '.ntwcrc.json';

const config: Schema.Config = {
  target: RECOMMANDED_VERSION,
  module: 'module',
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

const create = async (): Promise<void> => {
  log.print(`⏳  Generating ${fileName}...`);

  config.target = globals.project.target as Schema.Target;
  config.module = globals.project.module as Schema.Module;

  if (globals.project.addons.webpack) {
    set(config, 'builder.bundle', true);
  }

  if (!saveConfig(`./${fileName}`, config)) {
    log.clearLastLine();
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
};

const load = async (): Promise<void> => {
  const cfg = readJson(`./${fileName}`);

  if (isPlainObject(cfg)) {
    assignIn(config, cfg);
  }
};

export { config, create, load };
