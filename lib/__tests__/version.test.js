import { jest } from '@jest/globals';
import version from '../version.js';

const mockFns = {
  projectRoot: './testRoot',
  getCurrentVersion: jest.fn().mockResolvedValue('1.0.1'),
  getNewVersion: jest.fn().mockResolvedValue('1.0.2'),
  updateVersion: jest.fn(),
  prompt: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('version', () => {
  it('updates version', async () => {
    mockFns.prompt.mockResolvedValue({ versionBump: 'patch' });
    await version(mockFns);
    expect(mockFns.updateVersion).toBeCalledWith('./testRoot', '1.0.2');
  });
});
