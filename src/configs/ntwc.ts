import { RECOMMANDED_VERSION } from '../lib/version';
import log from '../lib/logger';
import { Config, Module, Target } from '../schema/ntwc';
import { saveConfig } from '../lib/filesystem';
import globals from '../global';
import { set } from 'lodash';

const fileName = '.ntwcrc.json';

const config: Config = {
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

  config.target = globals.project.target as Target;
  config.module = globals.project.module as Module;

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

export { config, create };
