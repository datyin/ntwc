import _ from 'lodash';

export function isActive(input: unknown): boolean {
  input = _.trim(_.toString(input)).toLowerCase();

  switch (input) {
    case 'on':
    case 'yes':
    case 'true':
    case '1':
    case 'active':
    case 'enabled': {
      return true;
    }
  }

  return false;
}
