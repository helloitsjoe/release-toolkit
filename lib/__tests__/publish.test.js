import { jest } from '@jest/globals';
import publish from '../publish.js';

let mockFns;
let argv;

beforeEach(() => {
  mockFns = {
    projectRoot: './testRoot',
    publishNpm: jest.fn(),
    createGitRelease: jest.fn(),
    getCurrentVersion: jest.fn().mockResolvedValue('1.0.1'),
  };
  argv = {
    dryRun: false,
    npm: true,
    github: true,
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('publish', () => {
  it('does a dry run', async () => {
    argv.dryRun = true;
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: true });
    expect(mockFns.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: true,
    });
  });

  it('publishes', async () => {
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: false });
    expect(mockFns.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });

  it('npm false does NOT publish npm', async () => {
    argv.npm = false;
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).not.toBeCalled();
    expect(mockFns.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });

  it('github false does NOT publish github', async () => {
    argv.github = false;
    await publish({ ...mockFns, argv });
    expect(mockFns.publishNpm).toBeCalledWith({ dryRun: false });
    expect(mockFns.createGitRelease).not.toBeCalled();
  });
});
