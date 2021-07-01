import { pathExistsSync } from 'fs-extra';
import { forEach, get, isArray, toString } from 'lodash';
import * as ntwc from '../configs/ntwc';
import { fullPath } from '../lib/filesystem';
import { Entry } from '../schema/ntwc';

export interface IEntryOutput {
  name: string;
  path: string;
}

export function getEntries(): IEntryOutput[] {
  const entries = get(ntwc, 'config.entries', []);

  if (!isArray(entries) || !entries.length) {
    return [];
  }

  const valid: IEntryOutput[] = [];

  forEach(entries, (entry: Entry) => {
    const src = toString(get(entry, 'script', ''));
    const path = fullPath(`./src/${src}.ts`);

    if (src && pathExistsSync(path)) {
      valid.push({
        name: src,
        path: path.toLowerCase()
      });
    }
  });

  return valid;
}
