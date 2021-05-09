import { jest } from '@jest/globals';
import verify from '../verify.js';

const cp = {
  execSync: jest.fn(),
};

afterEach(() => {
  jest.clearAllMocks();
});

it('throws if changelog is NOT updated', () => {
  expect.assertions(1);
  cp.execSync.mockReturnValue('foo.md');
  return verify({ cp }).catch(err => {
    expect(err.message).toMatch(/changelog not updated/i);
  });
});

it('does NOT throw if changelog IS updated', async () => {
  expect.assertions(1);
  cp.execSync.mockReturnValue('foo.md\nCHANGELOG.md');
  await verify({ cp });
  expect(cp.execSync).toBeCalled();
});
