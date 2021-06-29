import semver from 'semver';
import { isPlainObject, assignIn } from 'lodash';
import log from '../lib/logger';
import { readJson, saveConfig } from '../lib/filesystem';
import globals from '../global';

const fileName = 'tsconfig.json';

const config = {
  compilerOptions: {
    target: 'ES2020',
    lib: ['ES2020'],
    module: 'es2020',
    moduleResolution: 'node',
    outDir: './dist/',
    rootDir: './src/',
    removeComments: true,
    alwaysStrict: false,
    strictNullChecks: true,
    strictFunctionTypes: true,
    strictBindCallApply: true,
    strictPropertyInitialization: true,
    noImplicitAny: true,
    noImplicitThis: true,
    noUnusedLocals: true,
    noUnusedParameters: true,
    noImplicitReturns: true,
    noFallthroughCasesInSwitch: true,
    noUncheckedIndexedAccess: true,
    noPropertyAccessFromIndexSignature: true,
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    allowSyntheticDefaultImports: true,
    typeRoots: ['./src/typings', './node_modules/@types'],
    baseUrl: './',
    paths: {}
  },
  include: ['./src/**/*.ts'],
  exclude: ['**/node_modules', '**/*.spec.ts', '**/resources']
};

function setModule(recommanded: string): string {
  recommanded = recommanded.toLowerCase();

  if (globals.project.module === 'esnext') {
    return 'ESNext';
  } else if (globals.project.module === 'commonjs') {
    return 'CommonJS';
  } else {
    if (recommanded === 'commonjs' && globals.project.module === 'module') {
      return 'ES6';
    }

    return recommanded;
  }
}

function setTarget(): void {
  if (globals.project.target === 'esnext') {
    config.compilerOptions.target = 'ESNext';
    config.compilerOptions.module = setModule('ESNext');
    config.compilerOptions.lib = ['ESNext'];
    return;
  }

  if (!semver.valid(globals.project.target)) {
    return;
  }

  if (semver.gte(globals.project.target, '16.0.0')) {
    config.compilerOptions.target = 'ES2021';
    config.compilerOptions.module = setModule('ES2020');
    config.compilerOptions.lib = ['ES2020'];
    return;
  }

  if (semver.gte(globals.project.target, '14.0.0')) {
    config.compilerOptions.target = 'ES2020';
    config.compilerOptions.module = setModule('ES2020');
    config.compilerOptions.lib = ['ES2020'];
    return;
  }

  if (semver.gte(globals.project.target, '12.22.0')) {
    config.compilerOptions.target = 'ES2019';
    config.compilerOptions.module = setModule('ES2020');
    config.compilerOptions.lib = ['ES2020'];
    return;
  }

  if (semver.gte(globals.project.target, '12.9.0')) {
    config.compilerOptions.target = 'ES2019';
    config.compilerOptions.module = setModule('CommonJS');
    config.compilerOptions.lib = ['ES2020'];
    return;
  }

  if (semver.gte(globals.project.target, '12.0.0')) {
    config.compilerOptions.target = 'ES2019';
    config.compilerOptions.module = setModule('CommonJS');
    config.compilerOptions.lib = [
      'es2019',
      'es2020.bigint',
      'es2020.string',
      'es2020.symbol.wellknown'
    ];

    return;
  }

  if (semver.gte(globals.project.target, '10.0.0')) {
    config.compilerOptions.target = 'es2018';
    config.compilerOptions.module = setModule('CommonJS');
    config.compilerOptions.lib = ['es2018'];
    return;
  }

  if (semver.gte(globals.project.target, '8.10.0')) {
    config.compilerOptions.target = 'es2017';
    config.compilerOptions.module = setModule('CommonJS');
    config.compilerOptions.lib = ['es2017'];
    return;
  }

  if (semver.gte(globals.project.target, '7.5.0')) {
    config.compilerOptions.target = 'es2016';
    config.compilerOptions.module = setModule('CommonJS');
    config.compilerOptions.lib = ['es2016'];
    return;
  }

  if (semver.gte(globals.project.target, '6.17.1')) {
    config.compilerOptions.target = 'es2015';
    config.compilerOptions.module = setModule('CommonJS');
    config.compilerOptions.lib = ['es2015'];
    return;
  }
}

const create = async (): Promise<void> => {
  log.print(`⏳  Generating ${fileName}...`);

  setTarget();

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
