import log from '../lib/logger';
import { saveConfig } from '../lib/filesystem';
import globals from '../global';
import { set } from 'lodash';

const fileName = '.eslintrc.json';

const config = {
  env: {
    node: true
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {},
  ignorePatterns: ['dist/', 'node_modules/', 'resources/']
};

const create = async (): Promise<void> => {
  log.print(`⏳  Generating ${fileName}...`);

  if (globals.project.addons.prettier) {
    config.extends.push('plugin:prettier/recommended');
    config.plugins.push('prettier');

    set(config, 'rules.prettier/prettier', [
      'error',
      {
        endOfLine: 'auto'
      }
    ]);
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
