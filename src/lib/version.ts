import gs from './gs';
import { SemVerNumber } from '../schema/primitives';

export const MINIMAL_VERSION = '8.0.0';
export const RECOMMANDED_VERSION = '14.0.0';
export const LATEST_VERSION = '17.0.0';

interface IVersion {
  major: number;
  minor: number;
  patch: number;
}

/**
 * Convert version input into {IVersion}
 *
 * @param {unknown} input
 * @return {*}  {(IVersion | null)}
 */
export function getVersion(input: unknown): IVersion | null {
  if (typeof input === 'number') {
    const num = gs.num(input);

    if (num > 0) {
      return { major: num, minor: 0, patch: 0 };
    }

    return null;
  } else if (typeof input === 'string') {
    const pattern = /\d{1,3}(?:.)?(?:\d{1,3}|x)?(?:.)?(?:\d{1,3}|x)?/gi;

    const str = gs.str(input, undefined, '', { lc: 1 });
    const found = str.match(pattern);

    if (found && found[0]) {
      const seq = found[0].split('.');
      const major = gs.num(seq, [0]);

      if (major) {
        return { major: gs.num(seq, [0]), minor: gs.num(seq, [1]), patch: gs.num(seq, [2]) };
      }
    }
  }

  return null;
}

export function getVersionString(input: unknown): SemVerNumber | null {
  const version = getVersion(input);

  if (!version) {
    return null;
  }

  return `${version.major}.${version.minor}.${version.patch}`;
}
