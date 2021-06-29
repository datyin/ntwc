import log from '../../lib/logger';
import globals from '../../global';

import * as ntwc from '../../configs/ntwc';
import * as pkg from '../../configs/package';
import * as typescript from '../../configs/typescript';
import * as webpack from '../../configs/webpack';

export default async (): Promise<void> => {
  console.clear();
  log.info(`📚  Loading configuration files...`);

  await ntwc.load();
  await pkg.load();
  await typescript.load();

  if (ntwc.config.builder?.bundle === true) {
    await webpack.load();
  }

  log.print(`✔️  All configuration files were loaded.`);

  console.log(globals.argv, pkg.config);
};
