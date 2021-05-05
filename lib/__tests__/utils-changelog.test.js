import { jest } from '@jest/globals';
import createUtils from '../utils-changelog';

const packageJson =
  '{"version": "1.1.0", "name": "some-package", "scripts": {"test": "jest"}}';

let fs;
let cp;
beforeEach(() => {
  fs = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  };
  cp = {
    execSync: jest.fn(),
  };
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

  it('getVersion gets version from package.json', async () => {
    fs.readFile.mockResolvedValue(packageJson);
    const { getVersion } = createUtils({ fs });
    const version = await getVersion('foo');
    expect(fs.readFile).toBeCalledWith('foo/package.json');
    expect(version).toBe('1.1.0');
  });

  it('getRepo gets GitHub repo name', () => {
    cp.execSync.mockReturnValue('git@github.com:helloitsjoe/changelog.git');
    const { getRepo } = createUtils({ cp });
    const repoName = getRepo();
    expect(cp.execSync).toBeCalledWith('git remote get-url origin', {
      encoding: 'utf8',
    });
    expect(repoName).toBe('helloitsjoe/changelog');
  });

  describe('getChangelog', () => {
    it('gets existing CHANGELOG.md', async () => {
      fs.readFile.mockResolvedValue('## [1.0.0]');
      const { getChangelog } = createUtils({ fs });
      const changelog = await getChangelog('foo/bar');
      expect(changelog).toBe('## [1.0.0]');
      expect(fs.readFile).toBeCalledWith('foo/bar/CHANGELOG.md');
    });

    it('returns empty string if no CHANGELOG.md', async () => {
      fs.readFile.mockRejectedValue(new Error('No file!'));
      const { getChangelog } = createUtils({ fs });
      const changelog = await getChangelog('.');
      expect(changelog).toBe('');
    });
  });
});
