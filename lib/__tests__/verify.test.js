import { jest } from '@jest/globals';
import verify from '../verify.js';

let utils;

beforeEach(() => {
  utils = {
    getCurrentVersion: jest.fn(() => '1.0.1'),
    getPreviousVersion: jest.fn(() => '1.0.0'),
    getChangedFiles: jest.fn(() => ['foo.md', 'foo/CHANGELOG.md']),
  };
});

it('throws if changelog is NOT updated', () => {
  expect.assertions(1);
  utils.getChangedFiles.mockReturnValue(['foo.md']);
  return verify({ utils }).catch((err) => {
    expect(err.message).toMatch(/changelog not updated/i);
  });
});

it('does NOT throw if changelog IS updated', async () => {
  utils.getChangedFiles.mockReturnValue(['foo.md', 'foo/CHANGELOG.md']);
  await verify({ utils });
  expect(utils.getChangedFiles).toBeCalled();
});

it('throws if version is NOT updated', () => {
  expect.assertions(1);
  utils.getCurrentVersion.mockReturnValue('1.0.0');
  utils.getPreviousVersion.mockReturnValue('1.0.0');
  return verify({ utils }).catch((err) => {
    expect(err.message).toMatch(/version not updated/i);
  });
});

it('throws if previous version is greater than than current version', () => {
  expect.assertions(1);
  utils.getCurrentVersion.mockReturnValue('1.0.0');
  utils.getPreviousVersion.mockReturnValue('1.0.1');
  return verify({ utils }).catch((err) => {
    expect(err.message).toMatch(/version not updated/i);
  });
});

it('does NOT throw if version IS updated', async () => {
  utils.getCurrentVersion.mockReturnValue('1.0.1');
  utils.getPreviousVersion.mockReturnValue('1.0.0');
  await verify({ utils });
  expect(utils.getCurrentVersion).toBeCalled();
  expect(utils.getPreviousVersion).toBeCalled();
});

it('shows both messages if changelog and version are both NOT updated', async () => {
  expect.assertions(1);
  utils.getChangedFiles.mockReturnValue(['foo.md']);
  utils.getCurrentVersion.mockReturnValue('1.0.0');
  utils.getPreviousVersion.mockReturnValue('1.0.0');
  return verify({ utils }).catch((err) => {
    expect(err.message).toMatchInlineSnapshot(`
"Version not updated, please run the \`version\` command
Changelog not updated, please run the \`changelog\` command"
`);
  });
});
