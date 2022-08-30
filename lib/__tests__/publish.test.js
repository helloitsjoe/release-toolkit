import { jest } from '@jest/globals';
import publish from '../publish.js';

const projectRoot = './testRoot';
let utils;
let argv;

const changelog = 'Foo';

beforeEach(() => {
  utils = {
    publishNpm: jest.fn(),
    createGitRelease: jest.fn(),
    getCurrentVersion: jest.fn().mockResolvedValue('1.0.1'),
    getChangelog: jest.fn().mockResolvedValue(changelog),
    getGitHubInfo: jest.fn().mockReturnValue({ body: 'Body' }),
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
      dryRun: true,
    });
  });

  it('publishes', async () => {
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).toBeCalledWith({ dryRun: false });
    expect(utils.createGitRelease).toBeCalledWith({
      dryRun: false,
    });
  });

  it('npm false does NOT publish npm', async () => {
    argv.npm = false;
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).not.toBeCalled();
    expect(utils.createGitRelease).toBeCalledWith({
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
