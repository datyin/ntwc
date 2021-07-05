import ts from 'typescript';
import semver from 'semver';
import _ from 'lodash';
import log from '../lib/logger';
import { pathSlash, readJson, saveConfig } from '../lib/filesystem';
import globals from '../global';
import { getEntries } from '../common/entries';
import * as TSC from '../schema/tsc';
import * as ntwc from './ntwc';

const fileName = 'tsconfig.json';

export const config = {
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
  exclude: ['**/node_modules', '**/*.spec.ts', '**/resources', '**/bundle']
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

export async function create(): Promise<void> {
  log.print(`⏳  Generating ${fileName}...`);

  setTarget();

  if (!saveConfig(`./${fileName}`, config)) {
    log.error(`❌  Failed to generate ${fileName}`);
    process.exit(1);
  }

  log.clearLastLine();
  log.print(`✔️  ${fileName} generated.`);
}

export async function load(): Promise<void> {
  const cfg = readJson(`./${fileName}`);

  if (_.isPlainObject(cfg)) {
    _.assignIn(config, cfg);
  }
}

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine
};

export function logDiagnostics(diagnostics: ts.Diagnostic[]): void {
  const message =
    !!ts.sys.writeOutputIsTTY && ts.sys.writeOutputIsTTY()
      ? ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost)
      : ts.formatDiagnostics(diagnostics, formatHost);

  if (message) {
    log.error(message);
  }
}

export function parse(): ts.ParsedCommandLine {
  const cfg = _.cloneDeep(config);
  const fileNames = getEntries().map((e) => e.path);

  if (!fileNames || !fileNames.length) {
    log.error('Unable to find entrie points.');
    process.exit(1);
  }

  _.unset(cfg, 'include');
  _.set(cfg, 'files', fileNames);

  const parsed = ts.parseJsonConfigFileContent(cfg, ts.sys, globals.project.root);

  if (parsed.errors?.length) {
    logDiagnostics(parsed.errors);
    process.exit(1);
  }

  parsed.options.outDir = ntwc.config.structure.distribution;
  parsed.options.rootDir = ntwc.config.structure.source;

  return parsed;
}

export function paths(): TSC.Paths[] {
  const output: TSC.Paths[] = [];
  const pathsFound = _.get(config, 'compilerOptions.paths', {});

  if (!_.isPlainObject(pathsFound) || _.isEmpty(pathsFound)) {
    return output;
  }

  _.forEach(pathsFound, (pathOptions: string[], alias: string) => {
    alias = _.toString(pathSlash(alias).split('/*')[0]);

    // Incorrect alias
    if (!alias) {
      return;
    }

    let path = _.toString(_.get(pathOptions, '0', ''));
    path = _.toString(pathSlash(path).split('/*')[0]);

    // incorrect path
    if (!path) {
      return;
    }

    if (path.startsWith('./src/')) {
      path = path.slice(6);
    }

    path = _.trimStart(path, './');

    if (alias && path) {
      output.push({ alias, path });
    }
  });

  // Longest alias at the top so we don't get wrong mapping
  output.sort((a, b) => {
    if (a.alias.length > b.alias.length) {
      return -1;
    }

    if (a.alias.length < b.alias.length) {
      return 1;
    }

    return 0;
  });

  return output;
}
