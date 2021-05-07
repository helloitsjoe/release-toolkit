import { jest } from '@jest/globals';
import version from '../version.js';

const packageJson = `{
  "version": "1.0.0",
  "name": "changelog",
  "scripts": {
    "test": "jest"
  }
}`;

const mockFns = {
  projectRoot: './testRoot',
  getVersion: () => '1.0.1',
  updateVersion: jest.fn(),
  prompt: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});

describe('version', () => {
  it('updates version', async () => {
    await version(mockFns);
    expect(mockFns.updateVersion).toBeCalledWith('./testRoot', '1.0.2');
  });
});
