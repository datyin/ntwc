import _ from 'lodash';
import * as ntwc from '../configs/ntwc';
import { fullPath } from '../lib/filesystem';
import { Entry } from '../schema/ntwc';

export interface IEntryOutput {
  name: string;
  path: string;
}

export function getEntries(): IEntryOutput[] {
  const entries = _.get(ntwc, 'config.entries', []);

  if (!_.isArray(entries) || !entries.length) {
    return [];
  }

  const valid: IEntryOutput[] = [];

  _.forEach(entries, (entry: Entry) => {
    const src = _.toString(_.get(entry, 'script', '')).trim();

    if (src) {
      const path = fullPath(`${ntwc.config.structure.source}/${src}.ts`);

      valid.push({
        name: src,
        path: path.toLowerCase()
      });
    }
  });

  return valid;
}
