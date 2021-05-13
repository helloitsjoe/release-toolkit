import { jest } from '@jest/globals';
import tag from '../git-tag.js';

let mockFns; 

beforeEach(() => {
  mockFns = {
    createGitTag: jest.fn(),
    getPreviousVersion: () => '1.2.3',
    getCurrentVersion: () => '1.2.4',
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('git-tag', () => {
  it('calls createGitTag', async () => {
    await tag(mockFns);
    expect(mockFns.createGitTag).toBeCalledWith({version: '1.2.4'});
  });

  it('throws if versions are the same', async () => {
    expect.assertions(1);
    return tag({...mockFns, getCurrentVersion: () => '1.2.3' }).catch(err => {
      expect(err.message).toMatch(/Version not updated/i);
    });
    expect(mockFns.createGitTag).not.toBeCalled();
  });
});
