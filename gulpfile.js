const { task } = require('gulp');
const { copyFile, mkdir } = require('fs/promises');
const path = require('path');

task('build:icons', copyIcons);

async function copyIcons() {
  const destDir = path.join('dist', 'nodes', 'Socioi');
  await mkdir(destDir, { recursive: true });
  await copyFile(
    path.join('nodes', 'Socioi', 'socioi.png'),
    path.join(destDir, 'socioi.png'),
  );
}
