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

it('throws if previous version is greater than than current version', () => {
  expect.assertions(1);
  mockFns.getCurrentVersion.mockReturnValue('1.0.0');
  mockFns.getPreviousVersion.mockReturnValue('1.0.1');
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

it('shows both messages if changelog and version are both NOT updated', async () => {
  expect.assertions(1);
  mockFns.getChangedFiles.mockReturnValue(['foo.md']);
  mockFns.getCurrentVersion.mockReturnValue('1.0.0');
  mockFns.getPreviousVersion.mockReturnValue('1.0.0');
  return verify(mockFns).catch(err => {
    expect(err.message).toMatchInlineSnapshot(`
"Version not updated, please run the \`version\` command
Changelog not updated, please run the \`changelog\` command"
`);
  });
});
