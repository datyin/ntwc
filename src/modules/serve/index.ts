import _ from 'lodash';
import ts from 'typescript';
import fg from 'fast-glob';
import { emptyDir, readSync } from '../../lib/filesystem';
import { logDiagnostics } from '../../configs/typescript';
import { fixImports } from '../../lib/importer';
import { execute } from '../../lib/execute';
import log from '../../lib/logger';
import * as Schema from '../../schema/tsc';
import * as ntwc from '../../configs/ntwc';
import * as pkg from '../../configs/package';
import * as typescript from '../../configs/typescript';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let config: any = {};
let paths: Schema.Paths[] = [];
let npmModules: string[] = [];

function reportDiagnostic(diagnostic: ts.Diagnostic): void {
  logDiagnostics([diagnostic]);
}

async function reportWatchStatusChanged(diagnostic: ts.Diagnostic): Promise<void> {
  switch (diagnostic.code) {
    case 6031:
    case 6032: {
      console.clear();

      log.info(
        `🛠️  ${
          diagnostic.code === 6031
            ? 'Starting compilation in watch mode'
            : 'File change detected. Starting incremental compilation'
        }...`
      );

      break;
    }
    default: {
      if (diagnostic.messageText.toString().startsWith('Found 0 error')) {
        log.success('Watching for file changes.');

        const createdFiles: Record<string, string> = {};

        fg.sync(fg.escapePath(ntwc.config.structure.distribution) + '/**/*.js', {
          globstar: true
        }).forEach((file) => {
          createdFiles[file] = readSync(file);
        });

        fixImports(config.options, paths, npmModules, createdFiles);
        execute();
      } else {
        logDiagnostics([diagnostic]);
      }

      break;
    }
  }
}

export default async function (): Promise<void> {
  console.clear();

  await ntwc.load();
  await pkg.load();
  await typescript.load();

  config = typescript.parse();
  paths = typescript.paths();
  npmModules = _.keys(pkg.dependencies());

  const outDir = config.options.outDir as string;

  if (ntwc.config.builder.cleanBeforeCompile) {
    if (!emptyDir(outDir)) {
      log.error('Failed to clean output directory!');
      process.exit(1);
    }
  }

  const createProgram = ts.createSemanticDiagnosticsBuilderProgram;
  const host = ts.createWatchCompilerHost(
    config.fileNames,
    config.options,
    ts.sys,
    createProgram,
    reportDiagnostic,
    reportWatchStatusChanged
  );

  const defaultCreateProgram = host.createProgram;
  host.createProgram = (rootNames: unknown, options, host, oldProgram) =>
    defaultCreateProgram(rootNames as string[], options, host, oldProgram);

  const postProgramCreate = host.afterProgramCreate;
  host.afterProgramCreate = (program) => postProgramCreate?.(program);

  ts.createWatchProgram(host);
}
