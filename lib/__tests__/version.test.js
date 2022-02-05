import { jest } from '@jest/globals';
import version from '../version.js';

const projectRoot = './testRoot';
const prompt = jest.fn();
let utils;

beforeEach(() => {
  utils = {
    getCurrentVersion: jest.fn().mockResolvedValue('1.0.1'),
    updateVersion: jest.fn(),
  };
});

describe('version', () => {
  it('updates version with prompt', async () => {
    prompt.mockResolvedValue({ versionBump: 'patch' });
    await version({ projectRoot, prompt, utils });
    expect(utils.updateVersion).toBeCalledWith('./testRoot', '1.0.2');
  });

  it.each`
    versionBump | newVersion
    ${'major'}  | ${'2.0.0'}
    ${'minor'}  | ${'1.1.0'}
    ${'patch'}  | ${'1.0.2'}
  `(
    'skips prompt if CLI input ($versionBump)',
    async ({ versionBump, newVersion }) => {
      await version({
        projectRoot,
        prompt,
        utils,
        argv: { [versionBump]: true },
      });
      expect(utils.updateVersion).toBeCalledWith('./testRoot', newVersion);
      expect(prompt).not.toBeCalled();
    }
  );

  it('prefers more major version bump', async () => {
    await version({
      projectRoot,
      prompt,
      utils,
      argv: { major: true, minor: true },
    });
    expect(utils.updateVersion).toBeCalledWith('./testRoot', '2.0.0');
    expect(prompt).not.toBeCalled();
  });
});
