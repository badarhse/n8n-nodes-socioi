const { task } = require('gulp');
const { copyFile, mkdir } = require('fs/promises');
const path = require('path');

task('build:icons', copyIcons);

async function copyIcons() {
	const nodeDest = path.join('dist', 'nodes', 'Socioi');
	const credDest = path.join('dist', 'credentials');
	await mkdir(nodeDest, { recursive: true });
	await mkdir(credDest, { recursive: true });

	const icons = ['socioi.svg', 'socioi.dark.svg'];
	for (const icon of icons) {
		const src = path.join('nodes', 'Socioi', icon);
		await copyFile(src, path.join(nodeDest, icon));
		await copyFile(src, path.join(credDest, icon));
	}
}
