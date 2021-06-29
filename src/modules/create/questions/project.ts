import inquirer from 'inquirer';
import { trim } from 'lodash';
import semver from 'semver';
import globals from '../../../global';
import { getVersionString } from '../../../lib/version';
import { SemVerNumber } from '../../../schema/primitives';
import { getDefaultAuthor, getDefaultName } from '../defaults';

interface Answers {
  name?: string;
  version: SemVerNumber;
  description: string;
  author: string;
}

export default async function (): Promise<Answers> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questions: inquirer.QuestionCollection<any>[] = [
    {
      type: 'input',
      name: 'version',
      message: 'Project Version',
      default() {
        return globals.project.version;
      },
      filter(value) {
        return getVersionString(value);
      },
      validate(value) {
        if (!semver.valid(value)) {
          return 'Project version must be valid SemVer format.';
        }

        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Description',
      filter(value) {
        return trim(value);
      }
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author',
      default() {
        return getDefaultAuthor();
      },
      filter(value) {
        return trim(value);
      }
    }
  ];

  if (!globals.project.name) {
    questions.unshift({
      type: 'input',
      name: 'name',
      message: 'Project Name',
      default() {
        return getDefaultName();
      },
      filter(value: string) {
        return value.toLowerCase();
      }
    });
  }

  return await inquirer.prompt(questions);
}
