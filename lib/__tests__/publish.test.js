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
  it('publishes to npm', async () => {
    // mockFns.prompt.mockResolvedValue({ versionBump: 'patch' });
    // await version(mockFns);
    // expect(mockFns.updateVersion).toBeCalledWith('./testRoot', '1.0.2');
  });
});
