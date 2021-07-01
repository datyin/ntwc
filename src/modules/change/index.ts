import globals from '../../global';

export default async function (): Promise<void> {
  console.log(globals.argv);
}
