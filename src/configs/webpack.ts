const fileName = 'webpack.config.js';

const config = {};

const create = async (): Promise<void> => {
  // No need
};

const load = async (): Promise<void> => {
  // TODO: re-require file
  console.log(fileName);
};

export { config, create, load };
