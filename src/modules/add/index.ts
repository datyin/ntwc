import globals from '../../global';

export default async (): Promise<void> => {
  console.log(globals.argv);
};
