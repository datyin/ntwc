import { resolve } from 'path';
import { readJsonSync } from 'fs-extra';
import { get } from 'lodash';

export default function (): void {
  const path = resolve(__dirname, '..', '..', 'package.json');

  try {
    const content = readJsonSync(path, { encoding: 'utf8' });
    const version = get(content, 'version', '');

    if (version) {
      process.stdout.write(version);
      return;
    }
  } catch (_) {
    //
  }
}
