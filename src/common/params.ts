import { get, isArray, isUndefined } from 'lodash';
import globals from '../global';

export function getParam(name: string, alias: string): unknown {
  let value = get(globals.argv, name, undefined);

  if (isUndefined(value) && alias) {
    value = get(globals.argv, alias, undefined);
  }

  if (isArray(value)) {
    value = get(value, '0', undefined);
  }

  return value;
}

export function getArrayOfParam(name: string, alias: string): unknown {
  let value = get(globals.argv, name, undefined);

  if (isUndefined(value) && alias) {
    value = get(globals.argv, alias, undefined);
  }

  if (!isUndefined(value) && !isArray(value)) {
    value = [value];
  }

  return value;
}
