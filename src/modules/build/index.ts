import _ from 'lodash';
import ts from 'typescript';
import log from '../../lib/logger';
import globals from '../../global';
import { emptyDir, copy } from '../../lib/filesystem';
import { fixImports } from '../../lib/importer';

import * as ntwc from '../../configs/ntwc';
import * as pkg from '../../configs/package';
import * as typescript from '../../configs/typescript';
import * as webpack from '../../configs/webpack';

const configuration = async (): Promise<void> => {
  log.info(`📚  Loading configuration files...`);

  await ntwc.load();
  await pkg.load();
  await typescript.load();

  if (ntwc.config.builder?.bundle === true) {
    await webpack.load();
  }

  log.clearLastLine();
  log.print(`✔️  All configuration files were loaded.`);
};

const createdFiles: Record<string, string> = {};

const build = async (): Promise<void> => {
  log.info(`⏳  Building project...`);

  const config = typescript.parse();
  const outDir = config.options.outDir ?? globals.project.root + '/dist/';

  // Prepare destination
  if (!emptyDir(outDir)) {
    log.error('Failed to clean output directory!');
    process.exit(1);
  }

  if (!copy('./resources', outDir)) {
    log.error('Failed to copy resources!');
    process.exit(1);
  }

  // Compile
  const host = ts.createCompilerHost(config.options);
  host.writeFile = (fileName: string, contents: string) => (createdFiles[fileName] = contents);

  const program = ts.createProgram({
    options: config.options,
    rootNames: config.fileNames,
    projectReferences: config.projectReferences,
    host
  });

  const { diagnostics, emitSkipped } = program.emit();
  const errors = ts.getPreEmitDiagnostics(program).concat(diagnostics);

  if (errors.length) {
    typescript.logDiagnostics(errors);
    process.exit(1);
  }

  if (emitSkipped) {
    log.error('Compilation failed');
    return;
  }

  const paths = typescript.paths();
  const npmModules = _.keys(pkg.dependencies());
  fixImports(config.options, paths, npmModules, createdFiles);

  log.success('Compilation finished');
};

export default async (): Promise<void> => {
  console.log(globals.argv);
  console.clear();

  await configuration();
  await build();
};
