import { jest } from '@jest/globals';
import verify from '../verify.js';

const mockFns = {
  getCurrentVersion: () => '1.0.1',
  getPreviousVersion: () => '1.0.0',
  getChangedFiles: () => ['foo.md', 'foo/CHANGELOG.md'],
};

it('throws if changelog is NOT updated', () => {
  expect.assertions(1);
  const getChangedFiles = () => ['foo.md'];
  return verify({ ...mockFns, getChangedFiles }).catch(err => {
    expect(err.message).toMatch(/changelog not updated/i);
  });
});

it('does NOT throw if changelog IS updated', async () => {
  const getChangedFiles = jest
    .fn()
    .mockReturnValue(['foo.md', 'foo/CHANGELOG.md']);
  await verify({ ...mockFns, getChangedFiles });
  expect(getChangedFiles).toBeCalled();
});

it('throws if version is NOT updated', () => {
  expect.assertions(1);
  const getCurrentVersion = () => '1.0.0';
  const getPreviousVersion = () => '1.0.0';
  return verify({ ...mockFns, getCurrentVersion, getPreviousVersion }).catch(
    err => {
      expect(err.message).toMatch(/version not updated/i);
    }
  );
});

it('does NOT throw if version IS updated', async () => {
  const getCurrentVersion = jest.fn().mockReturnValue('1.0.1');
  const getPreviousVersion = jest.fn().mockReturnValue('1.0.0');
  await verify({ ...mockFns, getCurrentVersion, getPreviousVersion });
  expect(getCurrentVersion).toBeCalled();
  expect(getPreviousVersion).toBeCalled();
});
