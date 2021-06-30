import { pathExistsSync } from 'fs-extra';
import { forEach, get, isArray, toString } from 'lodash';
import * as ntwc from '../configs/ntwc';
import { fullPath } from '../lib/filesystem';
import { Entry } from '../schema/ntwc';

const getEntries = (): string[] => {
  const entries = get(ntwc, 'config.entries', []);

  if (!isArray(entries) || !entries.length) {
    return [];
  }

  const valid: string[] = [];

  forEach(entries, (entry: Entry) => {
    const src = toString(get(entry, 'script', ''));
    const path = fullPath(`./src/${src}.ts`);

    if (src && pathExistsSync(path)) {
      valid.push(path.toLowerCase());
    }
  });

  return valid;
};

export { getEntries };
