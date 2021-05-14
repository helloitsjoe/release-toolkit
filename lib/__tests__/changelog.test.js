import { jest } from '@jest/globals';
import changelog from '../changelog.js';

const existingChangelog = `## [1.0.0](https://github.com/helloitsjoe/changelog/releases/tag/v1.0.0) (2021-04-28)

**Feature**

- Add a thing
`;

let mockFns;
beforeEach(() => {
  mockFns = {
    projectRoot: './testRoot',
    getChangelog: () => existingChangelog,
    getCurrentVersion: () => '1.0.1',
    getRepo: () => 'helloitsjoe/changelog',
    getDate: () => '2021-05-02',
    updateChangelog: jest.fn(),
    prompt: jest.fn(() => ({ type: 'Bug fix', message: '- Fixed a bug' })),
  };
});

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

      - Add a thing
      "
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

      - Fixed a bug
      "
    `);
  });

  it('Autofills prompt if both CLI args provided', async () => {
    // Don't pass mocked prompt
    // eslint-disable-next-line
    const { prompt, ...mockFnsWithoutPrompt } = mockFns;
    await changelog({
      ...mockFnsWithoutPrompt,
      argv: { type: 'Chore', message: '- Update deps' },
    });
    const [firstArg, secondArg] = mockFns.updateChangelog.mock.calls[0];
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
    return changelog({ ...mockFns, getCurrentVersion: getBadVersion }).catch(
      err => {
        expect(err.message).toMatch(/version already exists/i);
      }
    );
  });
});
