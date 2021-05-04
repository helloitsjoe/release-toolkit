import { jest } from '@jest/globals';
import createUtils from '../lib/utils-changelog';

let fs;
beforeEach(() => {
  fs = {
    readFile: jest.fn().mockResolvedValue('## [1.0.0]'),
    writeFile: () => {},
  };
});

describe('utils', () => {
  describe('getChangelog', () => {
    it('gets existing CHANGELOG.md', async () => {
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
