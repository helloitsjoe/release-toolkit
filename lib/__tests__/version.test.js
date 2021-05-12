import { jest } from '@jest/globals';
import version from '../version.js';

let mockFns;

beforeEach(() => {
  mockFns = {
    projectRoot: './testRoot',
    getCurrentVersion: jest.fn().mockResolvedValue('1.0.1'),
    getNewVersion: jest.fn().mockResolvedValue('1.0.2'),
    updateVersion: jest.fn(),
    prompt: jest.fn(),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('version', () => {
  it('updates version with prompt', async () => {
    mockFns.prompt.mockResolvedValue({ versionBump: 'patch' });
    await version(mockFns);
    expect(mockFns.updateVersion).toBeCalledWith('./testRoot', '1.0.2');
  });

  it.each`
    versionBump | newVersion
    ${'major'}  | ${'2.0.0'}
    ${'minor'}  | ${'1.1.0'}
    ${'patch'}  | ${'1.0.2'}
  `(
    'skips prompt if CLI input ($versionBump)',
    async ({ versionBump, newVersion }) => {
      await version({ ...mockFns, argv: { [versionBump]: true } });
      expect(mockFns.updateVersion).toBeCalledWith('./testRoot', newVersion);
      expect(mockFns.prompt).not.toBeCalled();
    }
  );

  it('prefers more major version bump', async () => {
    await version({ ...mockFns, argv: { major: true, minor: true } });
    expect(mockFns.updateVersion).toBeCalledWith('./testRoot', '2.0.0');
    expect(mockFns.prompt).not.toBeCalled();
  });
});
