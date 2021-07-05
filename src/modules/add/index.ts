import _ from 'lodash';
import { getParam } from '../../common/params';
import globals from '../../global';
import { createFile, fullPath } from '../../lib/filesystem';
import { getEntries } from '../../common/entries';
import log from '../../lib/logger';
import * as ntwc from '../../configs/ntwc';

async function addEntry(input: unknown, argv: unknown): Promise<void> {
  const name = _.trim(_.toString(input)).toLowerCase();

  if (!name) {
    return;
  }

  const path = fullPath(`${globals.project.root}/src/${name}.ts`);
  createFile(path, `console.log('Entry: ${name}');\n`);

  // Add to confing
  const found = getEntries().find((e) => e.name === name);

  if (found) {
    log.warn(`Entry with name '${name}' already exists in ntwcrc.json`);
    return;
  }

  // Pass params and strip quote marks if there are some
  let params = _.toString(_.trim(argv as string));
  params = _.trim(params, `"'`);

  ntwc.config.entries.push({
    script: name,
    argv: params,
    runAfterDevBuild: true,
    runAfterBuild: false
  });

  await ntwc.save();
}

export default async function (): Promise<void> {
  await ntwc.load();

  const entry = getParam('entry', 'e');
  const argv = getParam('argv', 'a');

  if (entry) {
    addEntry(entry, argv);
  }
}
