import fs from 'fs/promises';
import cp from 'child_process';
import path from 'path';

export const getDate = (date = new Date()) => {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map(num => num.toString().padStart(2, '0'))
    .join('-');
};

export const getVersion = async projectRoot => {
  const packageJsonStr = await fs.readFile(
    path.join(projectRoot, 'package.json')
  );
  const packageJson = JSON.parse(packageJsonStr);
  return packageJson.version;
};

export const verifyExists = async changelogPath => {
  try {
    await fs.access(changelogPath);
  } catch (err) {
    console.log('CHANGELOG.md does not exist, creating...');
    await fs.writeFile(changelogPath, '');
  }
};

export const getRepo = () => {
  const repo = cp.execSync('git remote get-url origin', { encoding: 'utf8' });
  return repo.slice(repo.indexOf(':') + 1, repo.indexOf('.git'));
};
