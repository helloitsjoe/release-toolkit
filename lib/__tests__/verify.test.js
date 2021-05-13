import { jest } from '@jest/globals';
import verify from '../verify.js';

let mockFns;
beforeEach(() => {
  mockFns = {
    getCurrentVersion: jest.fn(() => '1.0.1'),
    getPreviousVersion: jest.fn(() => '1.0.0'),
    getChangedFiles: jest.fn(() => ['foo.md', 'foo/CHANGELOG.md']),
    // getGitTags: jest.fn(() => ['v1.0.0', 'v1.0.1']),
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

it('throws if changelog is NOT updated', () => {
  expect.assertions(1);
  mockFns.getChangedFiles.mockReturnValue(['foo.md']);
  return verify(mockFns).catch(err => {
    expect(err.message).toMatch(/changelog not updated/i);
  });
});

it('does NOT throw if changelog IS updated', async () => {
  mockFns.getChangedFiles.mockReturnValue(['foo.md', 'foo/CHANGELOG.md']);
  await verify(mockFns);
  expect(mockFns.getChangedFiles).toBeCalled();
});

it('throws if version is NOT updated', () => {
  expect.assertions(1);
  mockFns.getCurrentVersion.mockReturnValue('1.0.0');
  mockFns.getPreviousVersion.mockReturnValue('1.0.0');
  return verify(mockFns).catch(err => {
    expect(err.message).toMatch(/version not updated/i);
  });
});

it('does NOT throw if version IS updated', async () => {
  mockFns.getCurrentVersion.mockReturnValue('1.0.1');
  mockFns.getPreviousVersion.mockReturnValue('1.0.0');
  await verify(mockFns);
  expect(mockFns.getCurrentVersion).toBeCalled();
  expect(mockFns.getPreviousVersion).toBeCalled();
});

// TODO: These should be part of publish
// it('throws if git tags are NOT updated', () => {
//   expect.assertions(1);
//   mockFns.getCurrentVersion.mockReturnValue('1.0.0');
//   mockFns.getPreviousVersion.mockReturnValue('0.0.1');
//   mockFns.getGitTags.mockReturnValue(['v0.0.1']);
//   return verify(mockFns).catch(
//     err => {
//       expect(err.message).toMatch(/Git tag not updated/i);
//     }
//   );
// });

// it('does NOT throw if version IS updated', async () => {
//   mockFns.getCurrentVersion.mockReturnValue('1.0.1');
//   mockFns.getPreviousVersion.mockReturnValue('1.0.0');
//   mockFns.getGitTags.mockReturnValue(['v1.0.0', 'v1.0.1']);
//   await verify(mockFns);
//   expect(mockFns.getCurrentVersion).toBeCalled();
//   expect(mockFns.getPreviousVersion).toBeCalled();
//   expect(mockFns.getGitTags).toBeCalled();
// });
