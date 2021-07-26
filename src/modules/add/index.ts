import _ from 'lodash';
import { getParam } from '../../common/params';
import globals from '../../global';
import { createFile, fullPath } from '../../lib/filesystem';
import gs from '../../lib/gs';
import log from '../../lib/logger';
import * as ntwc from '../../configs/ntwc';

async function addEntry(input: unknown, argv: unknown, binaryName: unknown): Promise<void> {
  const name = gs.str(input, undefined, '', { trim: 1, lc: 1 });

  if (!name) {
    return;
  }

  const path = fullPath(`${globals.project.root}/src/${name}.ts`);
  const created = createFile(path, `console.log('Entry: ${name}');\n`);

  if (created) {
    // Add to confing
    const found = ntwc.config.entries.find((e) => e.script === name);

    if (found) {
      log.warn(`Entry with name '${name}' already exists in ${ntwc.fileName}`);
      return;
    }

    // Pass params and strip quote marks if there are some
    let params = gs.str(argv, undefined, '', { trim: 1 });
    params = _.trim(params, `"'`);

    ntwc.config.entries.push({
      script: name,
      argv: params,
      runAfterDevBuild: true,
      runAfterBuild: false,
      binaryName: gs.str(binaryName, undefined, '', { trim: 1 })
    });

    await ntwc.save();
  }
}

export default async function (): Promise<void> {
  await ntwc.load();

  const entry = getParam('entry', 'e');
  const argv = getParam('argv', 'a');
  const binaryName = getParam('bin', 'b');

  if (entry) {
    addEntry(entry, argv, binaryName);
  }
}
