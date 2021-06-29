import log from '../lib/logger';
import { saveConfig } from '../lib/filesystem';
import { getDefaultAuthor } from '../modules/create/defaults';
import globals from '../global';
import { set } from 'lodash';
import spawn from 'cross-spawn';

const fileName = 'package.json';

const config = {
  private: true,
  name: 'ntwc-project',
  version: '1.0.0',
  description: '',
  author: getDefaultAuthor(),
  license: 'MIT',
  main: './dist/index.js',
  type: 'module',
  scripts: {
    start: 'node .',
    serve: 'ntwc serve',
    build: 'ntwc build'
  },
  keywords: [],
  devDependencies: {}
};

const create = async (): Promise<void> => {
  log.print(`⏳  Generating ${fileName}...`);

  config.name = globals.project.name;
  config.version = globals.project.version;
  config.description = globals.project.description;
  config.author = globals.project.author;
  config.type = globals.project.module === 'commonjs' ? 'commonjs' : 'module';

  if (globals.project.target !== 'esnext') {
    set(config, 'engines.node', `>=${globals.project.target}`);
  }

  if (!saveConfig(`./${fileName}`, config)) {
    log.clearLastLine();
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
};

const install = async (): Promise<void> => {
  log.info('⏳  Installing required packages');

  const packages = ['@types/node'];

  if (globals.project.addons.eslint) {
    packages.push('eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser');
  }

  if (globals.project.addons.prettier) {
    packages.push('prettier');

    if (globals.project.addons.eslint) {
      packages.push('eslint-plugin-prettier', 'eslint-config-prettier');
    }
  }

  const npmScript = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  try {
    spawn.sync(npmScript, ['install', '--save-dev', ...packages], {
      stdio: 'ignore'
    });

    log.clearLastLine();
    log.print(`✔️  All required packages were installed.`);
  } catch (error) {
    log.clearLastLine();
    log.error(`❌  Failed to install required packages`, error?.message ?? '');
    process.exit(1);
  }
};

export { create, install };