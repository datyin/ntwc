import _ from 'lodash';
import ts from 'typescript';
import log from '../../lib/logger';
import { emptyDir, copy } from '../../lib/filesystem';
import { fixImports } from '../../lib/importer';

import * as ntwc from '../../configs/ntwc';
import * as pkg from '../../configs/package';
import * as typescript from '../../configs/typescript';
import * as webpack from '../../configs/webpack';

async function configuration(): Promise<void> {
  await ntwc.load();
  await pkg.load();
  await typescript.load();

  if (ntwc.config.builder?.bundle === true) {
    await webpack.load();
  }
}

const createdFiles: Record<string, string> = {};

async function build(): Promise<void> {
  const config = typescript.parse();
  const outDir = config.options.outDir as string;

  // Update packages before build
  if (ntwc.config.builder.updateBeforeCompile) {
    await pkg.update();
  }

  // Prepare destination
  if (ntwc.config.builder.cleanBeforeCompile) {
    if (!emptyDir(outDir)) {
      log.error('Failed to clean output directory!');
      process.exit(1);
    }
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
    process.exit(1);
  }

  const paths = typescript.paths();
  const npmModules = _.keys(pkg.dependencies());
  const externals = fixImports(config.options, paths, npmModules, createdFiles);

  if (ntwc.config.builder.bundle) {
    if (!emptyDir(ntwc.config.structure.bundle)) {
      log.error('Failed to clean output directory!');
      process.exit(1);
    }

    await webpack.compile();
  }

  await pkg.generate(externals);

  log.success('✔️  Project is compiled!');
}

export default async function (): Promise<void> {
  console.clear();
  log.info(`⏳  Building project...`);

  await configuration();
  await build();
}
