import { jest } from '@jest/globals';
import publish from '../publish.js';

let mockFns;

beforeEach(() => {
  mockFns = {
    projectRoot: './testRoot',
    publishNpm: jest.fn(),
    createGitRelease: jest.fn(),
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
    expect(mockFns.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: true,
    });
  });

  it('publishes', async () => {
    const argv = {};
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: false });
    expect(mockFns.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });

  it('npm false does NOT publish npm', async () => {
    const argv = { npm: false };
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).not.toBeCalled();
    expect(mockFns.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });

  it('github false does NOT publish github', async () => {
    const argv = { github: false };
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: false });
    expect(mockFns.createGitRelease).not.toBeCalled();
  });
});
