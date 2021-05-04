import { jest } from '@jest/globals';
import changelog from '../changelog.js';

const existingChangelog = `## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

**Feature**

- Add a thing
`;

const mockFns = {
  projectRoot: './testRoot',
  getChangelog: () => existingChangelog,
  getVersion: () => '1.0.1',
  getRepo: () => 'helloitsjoe/changelog',
  getDate: () => '2021-05-02',
  updateChangelog: jest.fn(),
  prompt: () => ({ type: 'Bug fix', description: '- Fixed a bug' }),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('changelog', () => {
  it('happy path', async () => {
    await changelog({ ...mockFns });
    const [firstArg, secondArg] = mockFns.updateChangelog.mock.calls[0];
    expect(firstArg).toBe('./testRoot');
    expect(secondArg).toMatchInlineSnapshot(`
      "## [1.0.1](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.1) (2021-05-02)

      **Bug fix**

      - Fixed a bug

      ## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

      **Feature**

      - Add a thing"
    `);
  });

  it('creates new CHANGELOG.md if none exists', async () => {
    const getNothing = () => '';
    await changelog({ ...mockFns, getChangelog: getNothing });
    const [firstArg, secondArg] = mockFns.updateChangelog.mock.calls[0];
    expect(firstArg).toBe('./testRoot');
    expect(secondArg).toMatchInlineSnapshot(`
      "## [1.0.1](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.1) (2021-05-02)

      **Bug fix**

      - Fixed a bug"
    `);
  });

  it('throws if version exists', async () => {
    const getBadVersion = () => '1.0.0';
    return changelog({ ...mockFns, getVersion: getBadVersion })
      .then(() => {
        throw new Error('Should fail');
      })
      .catch(err => {
        expect(err.message).toMatch(/version already exists/i);
      });
  });
});
