import _ from 'lodash';
import spawn from 'cross-spawn';
import log from '../lib/logger';
import { readJson, saveConfig } from '../lib/filesystem';
import { getDefaultAuthor } from '../modules/create/defaults';
import globals from '../global';
import * as ntwc from './ntwc';

const fileName = 'package.json';
const npmScript = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export const config = {
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

export async function create(): Promise<void> {
  log.print(`⏳  Generating ${fileName}...`);

  config.name = globals.project.name;
  config.version = globals.project.version;
  config.description = globals.project.description;
  config.author = globals.project.author;
  config.type = globals.project.module === 'commonjs' ? 'commonjs' : 'module';

  if (globals.project.target !== 'esnext') {
    _.set(config, 'engines.node', `>=${globals.project.target}`);
  }

  if (!saveConfig(`./${fileName}`, config)) {
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
}

export async function install(): Promise<void> {
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

  try {
    spawn.sync(npmScript, ['install', '--save-dev', ...packages], {
      stdio: 'ignore'
    });

    log.clearLastLine();
    log.print(`✔️  All required packages were installed.`);
  } catch (error) {
    log.error(`❌  Failed to install required packages`, error?.message ?? '');
    process.exit(1);
  }
}

export async function update(): Promise<void> {
  log.info('⏳  Updating packages');

  try {
    spawn.sync(npmScript, ['update'], { stdio: 'ignore' });

    log.clearLastLine();
    log.print(`✔️  All packages were updated.`);
  } catch (error) {
    log.error(`❌  Failed to update packages`, error?.message ?? '');
  }
}

export async function load(): Promise<void> {
  const cfg = readJson(`./${fileName}`);

  if (_.isPlainObject(cfg)) {
    _.assignIn(config, cfg);
  }
}

export function dependencies(): Record<string, string> {
  const dep: Record<string, string> = {};

  const mainDependencies = _.get(config, 'dependencies', {});
  const devDependencies = _.get(config, 'devDependencies', {});

  _.forEach(mainDependencies, (v, k) => (dep[k] = v));
  _.forEach(devDependencies, (v, k) => (dep[k] = v));

  return dep;
}

export async function generate(externals: string[]): Promise<void> {
  const cfg = {
    name: config.name,
    version: config.version,
    description: config.description,
    author: config.author,
    license: config.license,
    main: '',
    type: ntwc.config.module === 'commonjs' ? 'commonjs' : 'module',
    scripts: {
      start: 'node .'
    },
    keywords: [],
    engines: { node: `>=${ntwc.config.target}` },
    dependencies: {}
  };

  if (ntwc.config.target === 'esnext') {
    _.unset(cfg, 'engines.node');
  }

  // First entry as main point
  const firstEntry = _.head(ntwc.config.entries);

  if (firstEntry && firstEntry.script) {
    _.set(cfg, 'main', `./${firstEntry.script}`);
  }

  let root = ntwc.config.structure.distribution;

  // Create specific start point for each entry
  _.forEach(ntwc.config.entries, (entry) => {
    _.set(cfg, `scripts.start:${entry.script}`, `./${entry.script}.js`);
  });

  // get used dependencies only
  const dep = dependencies();
  const found = {};

  _.forEach(externals, (d) => {
    if (dep && dep[d]) {
      _.set(found, d, dep[d]);
    }
  });

  _.set(cfg, 'dependencies', found);
  saveConfig(`${root}/${fileName}`, cfg);

  // bundled
  if (ntwc.config.builder.bundle) {
    root = ntwc.config.structure.bundle;
    _.set(cfg, 'type', 'commonjs');

    saveConfig(`${root}/${fileName}`, cfg);
  }
}
