import { jest } from '@jest/globals';
import changelog from '../changelog.js';

const existingChangelog = `## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

**Feature**

- Add a thing
`;

const projectRoot = './testRoot';
let prompt;
let utils;

beforeEach(() => {
  utils = {
    getChangelog: () => existingChangelog,
    getCurrentVersion: () => '1.0.1',
    getRepo: () => 'helloitsjoe/changelog',
    getDate: () => '2021-05-02',
    updateChangelog: jest.fn(),
  };
  prompt = jest.fn(() => ({ type: 'Bug fix', message: '- Fixed a bug' }));
});

describe('changelog', () => {
  it('happy path', async () => {
    await changelog({ projectRoot, prompt, utils });
    const [firstArg, secondArg] = utils.updateChangelog.mock.calls[0];
    expect(firstArg).toBe('./testRoot');
    expect(secondArg).toMatchInlineSnapshot(`
      "## [1.0.1](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.1) (2021-05-02)

      **Bug fix**

      - Fixed a bug

      ## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

      **Feature**

      - Add a thing
      "
    `);
  });

  it('creates new CHANGELOG.md if none exists', async () => {
    const getNothing = () => '';
    utils.getChangelog = getNothing;
    await changelog({ projectRoot, utils, prompt, getChangelog: getNothing });
    const [firstArg, secondArg] = utils.updateChangelog.mock.calls[0];
    expect(firstArg).toBe('./testRoot');
    expect(secondArg).toMatchInlineSnapshot(`
      "## [1.0.1](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.1) (2021-05-02)

      **Bug fix**

      - Fixed a bug
      "
    `);
  });

  it('Autofills prompt if both CLI args provided', async () => {
    // Don't pass mocked prompt
    await changelog({
      utils,
      projectRoot,
      argv: { type: 'Chore', message: '- Update deps' },
    });
    const [firstArg, secondArg] = utils.updateChangelog.mock.calls[0];
    expect(firstArg).toBe('./testRoot');
    expect(secondArg).toMatchInlineSnapshot(`
      "## [1.0.1](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.1) (2021-05-02)

      **Chore**

      - Update deps

      ## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

      **Feature**

      - Add a thing
      "
    `);
  });

  it('throws if version exists', async () => {
    expect.assertions(1);
    const getBadVersion = () => '1.0.0';
    utils.getCurrentVersion = getBadVersion;
    return changelog({ utils, prompt, projectRoot }).catch((err) => {
      expect(err.message).toMatch(/version already exists/i);
    });
  });
});
