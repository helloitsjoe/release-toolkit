import child_process from 'child_process';

export default async function verify({ cp = child_process }) {
  const changedFiles = cp
    .execSync('git diff --name-only HEAD')
    .toString()
    .split('\n');

  if (!changedFiles.find(path => path.match('CHANGELOG.md'))) {
    throw new Error('Changelog not updated');
  }

  // Make sure version has been updated
}
