import { answers, parse } from './params';
import log from '../../lib/logger';
import globals from '../../global';

import * as workspace from './workspace';
import * as ntwc from '../../configs/ntwc';
import * as pkg from '../../configs/package';
import * as typescript from '../../configs/typescript';
import * as webpack from '../../configs/webpack';
import * as eslint from '../../configs/eslint';
import * as prettier from '../../configs/prettier';
import { isEmptyDirectory } from '../../lib/filesystem';

export default async function (): Promise<void> {
  if (!isEmptyDirectory(globals.project.root)) {
    log.error(`❌  Destination directory is not empty!`);
    process.exit(1);
  }

  await parse();
  await answers();

  console.clear();
  log.info(`🆕  Generating ${globals.project.name}...`);

  await workspace.create();
  await ntwc.create();
  await pkg.create();
  await pkg.install();
  await typescript.create();
  await webpack.create();
  await eslint.create();
  await prettier.create();
  await prettier.createIgnorePattern();

  log.success(`🤓  All set and ready! Happy codding!`);
}
