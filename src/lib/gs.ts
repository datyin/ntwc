import _ from 'lodash';
import { JSONObject } from '../schema/primitives';

type BOOL = boolean | 0 | 1;

type TPath = string | Array<string | number> | undefined;
type StrOrNA = string | undefined;
type NumOrNA = number | undefined;
type ArrOrNA = unknown[] | undefined;
type ObjOrNA = JSONObject | undefined;
type TNumOpt = NumOptions | undefined;
type TStrOpt = StrOptions | undefined;
type TBoolOpt = BoolOptions | undefined;

interface StrOptions {
  trim?: BOOL;
  lc?: BOOL;
  uc?: BOOL;
  deburr?: BOOL;
  separator?: string;
  spaceTo?: string;
}

interface NumOptions {
  decimals?: number;
}

interface BoolOptions {
  customTypes: boolean;
}

/**
 * Return string value
 *
 * @param {unknown} input
 * @param {TPath} [path=undefined]
 * @param {StrOrNA} [fallback=undefined]
 * @param {TStrOpt} [opt=undefined]
 * @return {*}  {string}
 */
function str(
  input: unknown,
  path: TPath = undefined,
  fallback: StrOrNA = undefined,
  opt: TStrOpt = undefined
): string {
  fallback = _.toString(fallback);

  if (input === undefined || input === null) {
    return fallback;
  }

  let value: string = path ? _.get(input, path, fallback) : input;

  if (_.isArray(value)) {
    const items: string[] = [];

    _.forEach(value, (element) => {
      if (_.isString(element) || _.isFinite(element) || _.isBoolean(element)) {
        items.push(opt?.trim ? _.toString(element).trim() : _.toString(element));
      }
    });

    value = items.join(opt?.separator ?? ',');
  }

  if (!_.isString(value)) {
    return fallback;
  }

  if (opt?.trim) value = value.trim();
  if (opt?.spaceTo) value = value.replace(/\s+/g, opt?.spaceTo ?? '');
  if (opt?.lc) value = value.toLowerCase();
  if (opt?.uc) value = value.toUpperCase();
  if (opt?.deburr) value = _.deburr(value);

  return value;
}

function num(
  input: unknown,
  path: TPath = undefined,
  fallback: NumOrNA = undefined,
  opt: TNumOpt = undefined
): number {
  fallback = _.toFinite(fallback);

  if (input === undefined || input === null) {
    return fallback;
  }

  const value: number = path ? _.toNumber(_.get(input, path, fallback)) : _.toNumber(input);

  if (!_.isFinite(value)) {
    return fallback;
  }

  return _.toFinite(Number(value).toFixed(opt?.decimals ?? 2));
}

function bool(input: unknown, path: TPath = undefined, fallback = false, opt: TBoolOpt = undefined): boolean {
  if (input === undefined || input === null) {
    return fallback === true ? true : false;
  }

  if (input === true || input === 1) return true;
  if (input === false || input === 0 || input === '') return false;

  const value = path ? _.toString(_.get(input, path, fallback === true ? true : false)) : _.toString(input);

  if (value === 'true' || value === '1') {
    return true;
  }

  if (opt?.customTypes) {
    switch (value) {
      case 'active':
      case 'yes':
      case 'on': {
        return true;
      }
    }
  }

  return false;
}

function arr(input: unknown, path: TPath = undefined, fallback: ArrOrNA = undefined): unknown[] {
  return path ? _.toArray(_.get(input, path, _.toArray(fallback))) : _.toArray(input);
}

function obj(input: unknown, path: TPath = undefined, fallback: ObjOrNA = undefined): JSONObject[] {
  return path ? _.toPlainObject(_.get(input, path, _.toPlainObject(fallback))) : _.toPlainObject(input);
}

export default { str, num, bool, arr, obj };
