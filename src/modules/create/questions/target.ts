import inquirer from 'inquirer';
import { toString } from 'lodash';
import semver from 'semver';
import globals from '../../../global';
import { getVersionString, MINIMAL_VERSION, RECOMMANDED_VERSION } from '../../../lib/version';
import { Target } from '../../../schema/project';

export default async function (): Promise<void> {
  if (globals.project.target) {
    return;
  }

  const answer = await inquirer.prompt({
    type: 'list',
    name: 'target',
    message: 'Targeting NodeJS version:',
    loop: false,
    choices: [
      'ESNext',
      `Installed (${process.versions.node})`,
      `Recommanded (${RECOMMANDED_VERSION})`,
      `17.0.0`,
      `16.0.0`,
      `14.0.0`,
      `12.0.0`,
      `Enter Specific Version`
    ],
    default() {
      return 2;
    },
    filter(value: string) {
      value = toString(value).toLowerCase();

      if (value.startsWith('enter spec')) {
        return 'custom';
      } else if (value.startsWith('esnext')) {
        return 'esnext';
      } else if (value.startsWith('recommanded')) {
        return RECOMMANDED_VERSION;
      } else if (value.startsWith('installed')) {
        return process.versions.node;
      } else {
        return value;
      }
    }
  });

  if (answer.target === 'custom') {
    const customTarget = await inquirer.prompt({
      type: 'input',
      name: 'target',
      message: 'Targeting NodeJS version:',
      default() {
        return RECOMMANDED_VERSION;
      },
      filter(value: string) {
        return getVersionString(value);
      },
      validate(value: string) {
        if (!semver.valid(value)) {
          return 'Target must be valid SemVer';
        }

        if (semver.lt(value, MINIMAL_VERSION)) {
          return `Target must be greater or equal to ${MINIMAL_VERSION}`;
        }

        return true;
      }
    });

    globals.project.target = customTarget.target as Target;
  } else {
    globals.project.target = answer.target as Target;
  }
}
