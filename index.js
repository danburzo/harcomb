#!/usr/bin/env node

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, join, dirname } from 'node:path';

import opsh from 'opsh';
import mimetype from 'whatwg-mimetype';

const commands = [
	'list',
	'ls',
	'extract'
];

const booleanOpts = [
	'help',
	'h',
	'version',
	'v',
	'force'
];

const args = opsh(process.argv.slice(2), booleanOpts);
const [command, ...operands] = args.operands; 

// Use the STDIN operand when none provided.
if (!operands.length) {
	operands.push('-');
}

if (args.options.h || args.options.help) {
	await outputHelp();
	process.exit();
}

if (args.options.v || args.options.version) {
	const pkg = await getPackage();
	console.log(pkg.version);
	process.exit();
}

if (!command || commands.indexOf(command) === -1) {
	console.error(`Expecting a command, one of: ${commands.join(', ')}`);
	process.exit(1);
}

/*
	Desired commands:

	* list
		* list selectively
			* list by mime type? (eg. --mime='image/*')
	* extract
		* Handle duplicate filenames
		* extract selectively (e.g. only images)
*/

function sortByTiming(a, b) {
	return new Date(a.startedDateTime) - new Date(b.startedDateTime);
}

const mimetypeFilter = type => {
	const filterType = mimetype.parse(type);
	if (filterType) {
		return function(entry) {
			const entryType = mimetype.parse(entry.response.content.mimeType);
			if (!entryType || entryType.type !== filterType.type) {
				return false;
			}
			return filterType.subtype === '*' || filterType.subtype === entryType.subtype;
		};
	}
	return v => true;
};

const entries = (
	await Promise.all(
		operands.map(
			it => it === '-' ? slurp(process.stdin) : readFile(it, 'utf8')
		)
	)
).flatMap(it => {
	return JSON.parse(it).log.entries
		.filter(mimetypeFilter(args.options.mimetype))
		.sort(sortByTiming)
});

const outdir = args.options.outdir || '.';

entries.forEach(async entry => {
	const entry_path = fileURLToPath(
		new URL(
			new URL(entry.request.url).pathname,
			'file:///'
		)
	).replace(/\/$/, '');
	if (command === 'list' || command === 'ls') {
		console.log(entry_path);
	}
	if (command === 'extract') {
		const output_path = join(outdir, entry_path);
		let output_data = entry.response.content.text || '';
		switch (entry.response.content.encoding) {
			case 'base64':
				output_data = atob(output_data);
		} 
		await mkdir(dirname(output_path), { recursive: true });
		await writeFile(output_path, output_data, { 
			encoding: 'binary',
			flag: args.options.force ? 'w' : 'wx'
		});
	}
});

async function slurp(stream) {
	let arr = [], len = 0;
	for await (let chunk of stream) {
		arr.push(chunk);
		len += chunk.length;
	}
	return Buffer.concat(arr, len).toString();
}

async function getPackage() {
	return JSON.parse(
		await readFile(new URL('./package.json', import.meta.url))
	);
}

async function outputHelp() {
	const pkg = await getPackage();
	console.log(`${pkg.name} ${pkg.version}`);
	console.log(`${pkg.description}`);
	console.log(`Homepage: ${pkg.homepage}`);
}