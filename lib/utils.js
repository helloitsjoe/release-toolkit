// TODO: Separate these by responsibility now that there are more utils
import nodeFs from 'fs/promises';
import nodeCp from 'child_process';
import path from 'path';
import chalk from 'chalk';
import realAxios from 'axios';

export default function createUtils({
  fs = nodeFs,
  cp = nodeCp,
  axios = realAxios,
} = {}) {
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

  const getDefaultBranch = () =>
    cp
      .execSync("git remote show origin | awk '/HEAD branch/ {print $NF}'")
      .toString()
      .trim();

  const getCurrentVersion = async projectRoot => {
    const packageJsonStr = await fs.readFile(
      path.join(projectRoot, 'package.json')
    );
    const packageJson = JSON.parse(packageJsonStr);
    return packageJson.version;
  };

  const getPreviousVersion = () => {
    const previousPackageJson = cp
      .execSync(
        `git fetch origin && git show origin/${getDefaultBranch()}:package.json`
      )
      .toString();

    return JSON.parse(previousPackageJson).version;
  };

  const _updateVersion = async (projectRoot, filename, newVersion) => {
    const packageJsonStr = await fs.readFile(path.join(projectRoot, filename));
    const packageJson = JSON.parse(packageJsonStr);
    const updated =
      JSON.stringify({ ...packageJson, version: newVersion }, null, 2) + '\n';
    await fs.writeFile(path.join(projectRoot, filename), updated);
  };

  const updateVersion = async (projectRoot, newVersion) => {
    if (!newVersion || !/\d\.\d\.\d/.test(newVersion)) {
      throw new Error(
        `Version: ${newVersion} must be in format {major}.{minor}.{patch}`
      );
    }
    await _updateVersion(projectRoot, 'package.json', newVersion);

    let packageLockExists = false;
    try {
      await fs.access(path.join(projectRoot, 'package-lock.json'));
      packageLockExists = true;
    } catch (e) {
      // Don't do anything if package-lock doesn't exist
    }

    if (packageLockExists) {
      console.log('Also updating package-lock.json...');
      await _updateVersion(projectRoot, 'package-lock.json', newVersion);
    }
  };

  const getChangedFiles = () => {
    return cp
      .execSync(`git diff --name-only origin/${getDefaultBranch()}`)
      .toString()
      .split('\n')
      .filter(Boolean);
  };

  const getRepo = () => {
    if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;

    const fullRepo = cp.execSync('git remote get-url origin').toString();
    const repo = fullRepo.split('.git')[0];

    const [, repoName] = repo.match(/.*github\.com[:/](.*)$/i);
    return repoName;
  };

  const createGitRelease = async ({ version, dryRun } = {}) => {
    if (!version) {
      throw new Error('Version is required');
    }

    const tag = `v${version}`;

    console.log(`Releasing ${tag} to GitHub...`);
    if (dryRun) {
      console.log(chalk.blue(`Released ${tag} to GitHub (dry run)`));
      return;
    }

    try {
      await axios.post(
        `https://api.github.com/repos/${getRepo()}/releases`,
        {
          tag_name: tag,
          name: tag,
          body: tag,
        },
        {
          headers: {
            accept: 'application/vnd.github.v3+json',
            authorization: `token ${process.env.GITHUB_TOKEN}`,
          },
        }
      );
      console.log(chalk.green(`Released ${version} to GitHub!`));
    } catch (e) {
      console.error(e.message);
      if (e.response.status === 422) {
        console.error(`Release ${version} already exists!`);
      } else if (e.response.status === 404) {
        console.error('404, may indicate a problem with authentication');
      }
      throw e;
    }
  };

  const publishNpm = ({ dryRun } = {}) => {
    return cp.execSync(`npm publish ${dryRun ? '--dry-run' : ''}`.trim());
  };

  return {
    getChangelog,
    getChangedFiles,
    updateChangelog,
    getDate,
    getCurrentVersion,
    getPreviousVersion,
    createGitRelease,
    updateVersion,
    publishNpm,
    getRepo,
  };
}
