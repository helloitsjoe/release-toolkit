import path from 'path';
import { jest } from '@jest/globals';
import publish from '../publish.js';
import createUtils from '../utils.js';

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
      version: '1.0.1',
      body: 'Body',
      dryRun: true,
    });
  });

  it('publishes', async () => {
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).toBeCalledWith({ dryRun: false });
    expect(utils.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      body: 'Body',
      dryRun: false,
    });
  });

  it('npm false does NOT publish npm', async () => {
    argv.npm = false;
    await publish({ utils, projectRoot, argv });
    expect(utils.publishNpm).not.toBeCalled();
    expect(utils.createGitRelease).toBeCalledWith({
      version: '1.0.1',
      body: 'Body',
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

describe('publish integration', () => {
  it('calls createGitRelease with the right args', async () => {
    // TODO: This is pretty ugly, restructure this, maybe break utils into
    // gitApi and npmApi or something
    argv.dryRun = true;
    const projectRoot = path.join(process.cwd(), 'lib', 'fixtures');
    const createGitRelease = jest.fn();
    const utils = {
      ...createUtils({
        projectRoot,
        axios: { post: jest.fn() },
      }),
      publishNpm: jest.fn(),
      createGitRelease,
    };

    await publish({ utils, projectRoot, argv });
    expect(createGitRelease).toBeCalledWith({
      version: '1.2.3',
      body: `**Chore**

Fix a thing`,
      dryRun: true,
    });
  });
});
