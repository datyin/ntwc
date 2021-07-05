import _, { isArray } from 'lodash';

export function getValue(cfg: unknown, path: string, fallback: unknown): string {
  return _.trim(_.toString(_.get(cfg, path, fallback))).toLowerCase();
}

export function getValues(cfg: unknown, path: string, fallback: unknown[]): unknown[] {
  const value = _.get(cfg, path, fallback);

  if (!isArray(value)) {
    return [value];
  }

  return value;
}
