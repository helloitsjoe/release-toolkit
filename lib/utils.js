import nodeFs from 'fs/promises';
import nodeCp from 'child_process';
import path from 'path';

export default function createUtils({ fs = nodeFs, cp = nodeCp } = {}) {
  const getChangelog = async projectRoot => {
    const changelogPath = path.join(projectRoot, 'CHANGELOG.md');

    try {
      return await fs.readFile(changelogPath);
    } catch (err) {
      return '';
    }
  };

  const updateChangelog = async (projectRoot, newChangelog) => {
    return fs.writeFile(path.join(projectRoot, 'CHANGELOG.md'), newChangelog);
  };

  const getDate = (date = new Date()) => {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map(num => num.toString().padStart(2, '0'))
      .join('-');
  };

  const getCurrentVersion = async projectRoot => {
    const packageJsonStr = await fs.readFile(
      path.join(projectRoot, 'package.json')
    );
    const packageJson = JSON.parse(packageJsonStr);
    return packageJson.version;
  };

  const updateVersion = async (projectRoot, newVersion) => {
    if (!newVersion || !/\d\.\d\.\d/.test(newVersion)) {
      throw new Error(
        `Version: ${newVersion} must be in format {major}.{minor}.{patch}`
      );
    }
    const packageJsonStr = await fs.readFile(
      path.join(projectRoot, 'package.json')
    );
    const packageJson = JSON.parse(packageJsonStr);
    const updated = JSON.stringify(
      { ...packageJson, version: newVersion },
      null,
      2
    );
    await fs.writeFile(path.join(projectRoot, 'package.json'), updated);
  };

  const getRepo = () => {
    const repo = cp.execSync('git remote get-url origin', { encoding: 'utf8' });
    return repo.slice(repo.indexOf(':') + 1, repo.indexOf('.git'));
  };

  return {
    getChangelog,
    updateChangelog,
    getDate,
    getCurrentVersion,
    updateVersion,
    getRepo,
  };
}
