import { jest } from '@jest/globals';
import publish from '../publish.js';

let mockFns;

beforeEach(() => {
  mockFns = {
    projectRoot: './testRoot',
    publishNpm: jest.fn(),
    createGitTag: jest.fn(),
    getCurrentVersion: jest.fn().mockResolvedValue('1.0.1'),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('publish', () => {
  it('does a dry run', async () => {
    const argv = { dryRun: true };
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: true });
    expect(mockFns.createGitTag).toBeCalledWith({
      version: '1.0.1',
      dryRun: true,
    });
  });

  it('publishes', async () => {
    const argv = {};
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: false });
    expect(mockFns.createGitTag).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });
});
