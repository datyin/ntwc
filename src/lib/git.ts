import { execSync } from 'child_process';

interface IGitUser {
  name: string;
  email: string;
}

function getGitUser(): IGitUser {
  const output = {
    name: '',
    email: ''
  };
  try {
    output.name = execSync('git config --get user.name', { encoding: 'utf8' }).trim();
    output.email = execSync('git config --get user.email', { encoding: 'utf8' }).trim();
  } catch (_) {
    //
  }

  return output;
}

export { getGitUser };
