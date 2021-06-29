import inquirer from 'inquirer';
import globals from '../../../global';

function setDefaultState(param: boolean | null, def: boolean): boolean {
  return param === null ? def : param;
}

export default async function (): Promise<void> {
  if (
    globals.project.addons.webpack !== null &&
    globals.project.addons.eslint !== null &&
    globals.project.addons.prettier !== null
  ) {
    // Already set by argv
    return;
  }

  const answer = await inquirer.prompt({
    type: 'checkbox',
    name: 'addons',
    message: 'Addons:',
    choices: [
      {
        name: 'WebPack',
        checked: setDefaultState(globals.project.addons.webpack, false),
        value: 'webpack'
      },
      {
        name: 'ESLint',
        checked: setDefaultState(globals.project.addons.eslint, true),
        value: 'eslint'
      },
      {
        name: 'Prettier',
        checked: setDefaultState(globals.project.addons.prettier, true),
        value: 'prettier'
      }
    ],
    filter(values: string[]) {
      return values.map((v) => v.toLowerCase());
    }
  });

  globals.project.addons.webpack = answer.addons.includes('webpack');
  globals.project.addons.eslint = answer.addons.includes('eslint');
  globals.project.addons.prettier = answer.addons.includes('prettier');
}
