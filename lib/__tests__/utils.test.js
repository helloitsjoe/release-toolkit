import { jest } from '@jest/globals';
import createUtils from '../utils';

const GIT_REPO_SSH = 'git@github.com:helloitsjoe/release-toolkit.git';
const GIT_REPO_HTTPS = 'https://github.com/helloitsjoe/release-toolkit';
const GIT_RELEASE_URL =
  'https://api.github.com/repos/helloitsjoe/release-toolkit/releases';
const GET_DEFAULT_BRANCH_COMMAND =
  "git remote show origin | awk '/HEAD branch/ {print $NF}'";
const packageJson =
  '{"version": "1.1.0", "name": "some-package", "scripts": {"test": "jest"}}';

let fs;
let cp;
let axios;
beforeEach(() => {
  fs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn(),
  };
  cp = {
    execSync: jest.fn(),
  };
  axios = {
    post: jest.fn(),
  };
});

afterEach(() => {
  delete process.env.GITHUB_REPOSITORY;
  delete process.env.GITHUB_TOKEN;
  jest.clearAllMocks();
});

describe('utils', () => {
  it('updateChangelog writes CHANGELOG to projectRoot', async () => {
    const { updateChangelog } = createUtils({ fs });
    await updateChangelog('foo', '## [1.1.0]');
    expect(fs.writeFile).toBeCalledWith('foo/CHANGELOG.md', '## [1.1.0]');
  });

  it('getDate formats date', () => {
    const { getDate } = createUtils();
    // 2021-05-05
    expect(getDate()).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('getCurrentVersion gets version from package.json', async () => {
    fs.readFile.mockResolvedValue(packageJson);
    const { getCurrentVersion } = createUtils({ fs });
    const version = await getCurrentVersion('foo');
    expect(fs.readFile).toBeCalledWith('foo/package.json');
    expect(version).toBe('1.1.0');
  });

  it('getPreviousVersion gets version from package.json', async () => {
    cp.execSync.mockReturnValueOnce('master').mockReturnValueOnce(packageJson);
    const { getPreviousVersion } = createUtils({ cp });
    const version = getPreviousVersion('foo');
    expect(cp.execSync).toBeCalledWith(GET_DEFAULT_BRANCH_COMMAND);
    expect(cp.execSync).toBeCalledWith(
      'git fetch origin && git show origin/master:package.json'
    );
    expect(version).toBe('1.1.0');
  });

  it('getChangedFiles gets array of changed files', () => {
    cp.execSync.mockReturnValueOnce('main').mockReturnValueOnce(`foo/bar.js
bar/baz.js
baz/foo.js
`);

    const { getChangedFiles } = createUtils({ cp });
    const changedFiles = getChangedFiles();
    expect(cp.execSync).toBeCalledWith(GET_DEFAULT_BRANCH_COMMAND);
    expect(cp.execSync).toBeCalledWith('git diff --name-only origin/main');
    expect(changedFiles).toEqual(['foo/bar.js', 'bar/baz.js', 'baz/foo.js']);
  });

  describe('getRepo', () => {
    it('getRepo gets GitHub repo name from GITHUB_REPOSITORY env var', () => {
      process.env.GITHUB_REPOSITORY = 'helloitsjoe/release-toolkit';
      const { getRepo } = createUtils({ cp });
      const repoName = getRepo();
      expect(repoName).toBe('helloitsjoe/release-toolkit');
    });

    it('getRepo gets GitHub repo name (ssh)', () => {
      cp.execSync.mockReturnValueOnce(Buffer.from(GIT_REPO_SSH));
      const { getRepo } = createUtils({ cp });
      const repoName = getRepo();
      expect(repoName).toBe('helloitsjoe/release-toolkit');
    });

    it('getRepo gets GitHub repo name (https)', () => {
      cp.execSync.mockReturnValueOnce(Buffer.from(GIT_REPO_HTTPS));
      const { getRepo } = createUtils({ cp });
      const repoName = getRepo();
      expect(repoName).toBe('helloitsjoe/release-toolkit');
    });
  });

  describe('getChangelog', () => {
    it('gets existing CHANGELOG.md', async () => {
      fs.readFile.mockResolvedValue('## [1.0.0]');
      const { getChangelog } = createUtils({ fs });
      const changelog = await getChangelog('foo/bar');
      expect(changelog).toBe('## [1.0.0]');
      expect(fs.readFile).toBeCalledWith('foo/bar/CHANGELOG.md', 'utf-8');
    });

    it('returns empty string if no CHANGELOG.md', async () => {
      fs.readFile.mockRejectedValue(new Error('No file!'));
      const { getChangelog } = createUtils({ fs });
      const changelog = await getChangelog('.');
      expect(changelog).toBe('');
    });
  });

  describe('getGitHubInfo', () => {
    it('parses changelog for title and body', () => {
      const changelog = `## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

**Feature**

- Add a thing

## [0.1.9](https://github.com/helloitsjoe/changelog/releases/tag/v0.1.9) (2021-04-28)

**Chore**

- Fix a thing
`;

      const { getGitHubInfo } = createUtils({ fs });
      expect(getGitHubInfo(changelog)).toEqual({
        body: `**Feature**

- Add a thing`,
      });
    });
  });

  describe('updateVersion', () => {
    it('updates package.json with new version', async () => {
      fs.readFile.mockResolvedValue(packageJson);
      // No package-lock.json
      fs.access.mockRejectedValue(new Error('file does not exist'));
      const { updateVersion } = createUtils({ fs });
      await updateVersion('foo', '1.1.0');
      expect(fs.writeFile).toBeCalledWith(
        'foo/package.json',
        `{
  "version": "1.1.0",
  "name": "some-package",
  "scripts": {
    "test": "jest"
  }
}
`
      );
      expect(fs.writeFile).not.toBeCalledWith(
        'foo/package-lock.json',
        `{
  "version": "1.1.0",
  "name": "some-package",
  "scripts": {
    "test": "jest"
  }
}
`
      );
    });

    it('updates package-lock.json if it exists', async () => {
      fs.readFile.mockResolvedValue(packageJson);
      // Includes package-lock.json (npm instead of yarn)
      fs.access.mockResolvedValue(undefined);
      const { updateVersion } = createUtils({ fs });
      await updateVersion('foo', '1.1.0');
      expect(fs.writeFile).toBeCalledWith(
        'foo/package.json',
        `{
  "version": "1.1.0",
  "name": "some-package",
  "scripts": {
    "test": "jest"
  }
}
`
      );
      expect(fs.writeFile).toBeCalledWith(
        'foo/package-lock.json',
        `{
  "version": "1.1.0",
  "name": "some-package",
  "scripts": {
    "test": "jest"
  }
}
`
      );
    });

    it('throws if version is formatted incorrectly', async () => {
      expect.assertions(1);
      const { updateVersion } = createUtils({ fs });
      return updateVersion('foo', '1.1').catch((err) => {
        expect(err.message).toMatch(/{major}.{minor}.{patch}/);
      });
    });
  });

  describe('git release', () => {
    it('creates release from version', async () => {
      process.env.GITHUB_TOKEN = 'abc123';
      cp.execSync.mockReturnValue(Buffer.from(GIT_REPO_SSH));
      const { createGitRelease } = createUtils({ axios, cp });
      await createGitRelease({
        version: '1.2.3',
        body: 'Body',
      });
      expect(axios.post).toBeCalledWith(
        GIT_RELEASE_URL,
        { tag_name: 'v1.2.3', name: 'v1.2.3', body: 'Body' },
        {
          headers: {
            accept: expect.any(String),
            authorization: `token abc123`,
          },
        }
      );
    });

    it('dry run does not release', async () => {
      const { createGitRelease } = createUtils({ axios });
      await createGitRelease({ version: '1.2.3', dryRun: true });
      expect(axios.post).not.toBeCalled();
    });

    it('throws if version and customTag are missing', async () => {
      expect.assertions(1);
      const { createGitRelease } = createUtils({ axios });
      return createGitRelease().catch((err) => {
        expect(err.message).toMatch(/version is required/i);
      });
    });
  });

  describe('publish', () => {
    it('does a dry run', () => {
      const { publishNpm } = createUtils({ cp });
      publishNpm({ dryRun: true });
      expect(cp.execSync).toBeCalledWith('npm publish --dry-run');
    });

    it('publishes', () => {
      const { publishNpm } = createUtils({ cp });
      publishNpm();
      expect(cp.execSync).toBeCalledWith('npm publish');
    });
  });
});
