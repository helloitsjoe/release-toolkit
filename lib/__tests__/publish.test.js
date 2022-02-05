import { jest } from '@jest/globals';
import publish from '../publish.js';

const projectRoot = './testRoot';
let utils;
let argv;

beforeEach(() => {
  utils = {
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

describe('publish', () => {
  it('does a dry run', async () => {
    argv.dryRun = true;
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).toBeCalledWith({ dryRun: true });
    expect(utils.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: true,
    });
  });

  it('publishes', async () => {
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).toBeCalledWith({ dryRun: false });
    expect(utils.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });

  it('npm false does NOT publish npm', async () => {
    argv.npm = false;
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).not.toBeCalled();
    expect(utils.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      dryRun: false,
    });
  });

  it('github false does NOT publish github', async () => {
    argv.github = false;
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).toBeCalledWith({ dryRun: false });
    expect(utils.createGitRelease).not.toBeCalled();
  });
});
